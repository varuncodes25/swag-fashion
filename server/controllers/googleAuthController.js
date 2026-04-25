const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcrypt");

// ✅ Initialize Google OAuth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ Helper function to find or create user
const findOrCreateGoogleUser = async (payload) => {
  const { sub: googleId, email, name, picture, email_verified } = payload;
  
  console.log("🔍 Finding or creating user:", { email, googleId });

  // Try to find user by googleId OR email
  let user = await User.findOne({ 
    $or: [{ googleId }, { email }] 
  });

  if (!user) {
    console.log("🆕 Creating new user:", email);
    
    // Create new user
 user = new User({
  name: name || email.split('@')[0],
  email: email,
  googleId: googleId,
  provider: "google",
  isEmailVerified: email_verified || true,
  avatar: picture || null,
  // password: null, ← COMMENT KAR DO YA DELETE
  lastLogin: new Date()
});
    
    await user.save();
    console.log("✅ New user created:", user._id);
  } else {
    console.log("📝 Updating existing user:", user._id);
    
    // Update existing user
    if (!user.googleId) {
      user.googleId = googleId;
    }
    if (!user.avatar && picture) {
      user.avatar = picture;
    }
    if (user.provider !== 'google') {
      user.provider = 'google';
    }
    if (!user.isEmailVerified && email_verified) {
      user.isEmailVerified = true;
    }
    user.lastLogin = new Date();
    await user.save();
    console.log("✅ User updated:", user._id);
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
    res.status(401).json({ 
      success: false, 
      message: error.message || "Google login failed. Please try again." 
    });
  }
};

// ✅ 2. GET GOOGLE AUTH URL (for redirect flow)
const getGoogleAuthUrl = async (req, res) => {
  try {
    console.log("📡 Backend generating Google URL");
    
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'profile email',
      access_type: 'offline',
      prompt: 'consent'
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
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
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
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}`;
      
      return res.redirect(redirectUrl);
      
    } catch (tokenError) {
      console.error("❌ Token exchange failed:", tokenError);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=token_exchange_failed`);
    }
    
  } catch (error) {
    console.error("❌ Google Callback Error:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};

module.exports = { 
  googleOneTapLogin,
  getGoogleAuthUrl,
  googleCallback
};