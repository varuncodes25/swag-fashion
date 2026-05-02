const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");

// ✅ Initialize Google OAuth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const publicFrontendBase = () =>
  (process.env.FRONTEND_URL || process.env.CLIENT_URL || "").replace(/\/$/, "");

const DUPLICATE_KEY_CODE = 11000;

const mapDuplicateKeyMessage = (err) => {
  const key =
    (err.keyPattern && Object.keys(err.keyPattern)[0]) ||
    (err.keyValue && Object.keys(err.keyValue)[0]) ||
    "";
  if (key === "phone") {
    return "This phone number is already linked to another account.";
  }
  if (key === "email" || key === "googleId") {
    return "An account with this email or Google profile already exists. Try signing in.";
  }
  return "Account could not be created because of a duplicate record. Try signing in.";
};

// ✅ Helper: find or create (handles race double-submit + duplicate keys)
const findOrCreateGoogleUser = async (payload) => {
  const { sub: googleId, email, name, picture, email_verified: emailVerified } = payload;
  const emailLower = (email || "").toLowerCase().trim();

  console.log("🔍 Finding or creating user:", { email: emailLower, googleId });

  let user = await User.findOne({
    $or: [{ googleId }, { email: emailLower }],
  }).select("+googleId +password");

  if (!user) {
    console.log("🆕 Creating new user:", emailLower);
    user = new User({
      name: name || emailLower.split("@")[0],
      email: emailLower,
      googleId,
      provider: "google",
      isEmailVerified: emailVerified ?? true,
      avatar: picture || undefined,
      lastLogin: new Date(),
    });
    try {
      await user.save();
      console.log("✅ New user created:", user._id);
    } catch (err) {
      if (err.code === DUPLICATE_KEY_CODE) {
        user = await User.findOne({
          $or: [{ googleId }, { email: emailLower }],
        }).select("+googleId +password");
        if (!user) {
          err.message = mapDuplicateKeyMessage(err);
          throw err;
        }
        console.log("✅ Resolved duplicate key race, using existing user:", user._id);
        if (!user.googleId) {
          user.googleId = googleId;
        }
        if (!user.isEmailVerified && emailVerified) {
          user.isEmailVerified = true;
        }
        if (!user.password) {
          user.provider = "google";
        }
        user.lastLogin = new Date();
        await user.save();
      } else {
        throw err;
      }
    }
  } else {
    console.log("📝 Updating existing user:", user._id);

    if (!user.googleId) {
      user.googleId = googleId;
    }
    if (!user.avatar && picture) {
      user.avatar = picture;
    }
    // Do not flip local+password accounts to Google-only (keeps email/password login working)
    if (!user.password) {
      user.provider = "google";
    }
    if (!user.isEmailVerified && emailVerified) {
      user.isEmailVerified = true;
    }
    user.lastLogin = new Date();
    try {
      await user.save();
      console.log("✅ User updated:", user._id);
    } catch (err) {
      if (err.code === DUPLICATE_KEY_CODE) {
        user = await User.findOne({
          $or: [{ googleId }, { email: emailLower }],
        }).select("+googleId +password");
        if (!user) {
          err.message = mapDuplicateKeyMessage(err);
          throw err;
        }
      } else {
        throw err;
      }
    }
  }

  return user;
};

// ✅ 1. GOOGLE ONE TAP LOGIN (Token-based)
const googleOneTapLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    console.log("📡 Received Google One Tap token");
    console.log("🔑 Token length:", token?.length);

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: "No token provided" 
      });
    }

    // Verify Google token
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
    } catch (verifyError) {
      console.error("❌ Google token verification failed:", verifyError);
      
      if (verifyError.message.includes("expired")) {
        return res.status(401).json({ 
          success: false, 
          message: "Google token has expired. Please login again." 
        });
      }
      
      return res.status(401).json({ 
        success: false, 
        message: "Invalid Google token: " + verifyError.message 
      });
    }

    const payload = ticket.getPayload();
    console.log("✅ Token verified successfully for:", payload.email);

    // ✅ Find or create user using helper function
    const user = await findOrCreateGoogleUser(payload);

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save();

    console.log("✅ Login successful for:", user.email);

    // Send response
    res.json({
      success: true,
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        provider: user.provider,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error("❌ Google One Tap Error:", error);
    if (error.code === DUPLICATE_KEY_CODE) {
      return res.status(409).json({
        success: false,
        message: mapDuplicateKeyMessage(error),
      });
    }
    res.status(401).json({
      success: false,
      message: error.message || "Google login failed. Please try again.",
    });
  }
};

// ✅ 2. GET GOOGLE AUTH URL (for redirect flow)
const getGoogleAuthUrl = async (req, res) => {
  try {
    console.log("📡 Backend generating Google URL");
    
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!clientId?.trim() || !redirectUri?.trim()) {
      return res.status(500).json({
        success: false,
        message: "Google OAuth is not configured (GOOGLE_CLIENT_ID / GOOGLE_REDIRECT_URI).",
      });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent select_account",
    });

    const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    console.log("✅ Generated URL:", redirectUrl);
    
    res.json({
      success: true,
      url: redirectUrl
    });

  } catch (error) {
    console.error("❌ Error generating Google URL:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate Google login URL" 
    });
  }
};

// ✅ 3. GOOGLE CALLBACK HANDLER (for redirect flow) - FIXED
const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.redirect(`${publicFrontendBase()}/login?error=no_code`);
    }

    console.log("📡 Received Google callback with code");

    // ✅ Exchange code for tokens
    try {
      const response = await client.getToken({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      });

      console.log("✅ Tokens received from Google");
      
      const { tokens } = response;

      // Verify the ID token
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      console.log("✅ Payload verified for:", payload.email);

      // ✅ Find or create user using helper function
      const user = await findOrCreateGoogleUser(payload);

      // Generate JWT tokens
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      // Store refresh token in database
      user.refreshToken = refreshToken;
      await user.save();

      console.log("✅ User authenticated successfully:", user.email);

      // ✅ Redirect to frontend with tokens
      const redirectUrl = `${publicFrontendBase()}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}`;
      
      return res.redirect(redirectUrl);
      
    } catch (tokenError) {
      console.error("❌ Token exchange failed:", tokenError);
      return res.redirect(`${publicFrontendBase()}/login?error=token_exchange_failed`);
    }
    
  } catch (error) {
    console.error("❌ Google Callback Error:", error);
    return res.redirect(`${publicFrontendBase()}/login?error=auth_failed`);
  }
};

module.exports = { 
  googleOneTapLogin,
  getGoogleAuthUrl,
  googleCallback
};