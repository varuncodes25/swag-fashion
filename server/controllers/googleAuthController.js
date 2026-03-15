const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcrypt");

// ✅ Initialize Google OAuth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    // Verify Google token with more detailed error handling
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
    } catch (verifyError) {
      console.error("❌ Google token verification failed:", verifyError);
      console.error("❌ Error name:", verifyError.name);
      console.error("❌ Error message:", verifyError.message);
      
      // Check if it's an expiration error
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
    console.log("✅ Token verified successfully");
    console.log("📦 Payload:", {
      email: payload.email,
      name: payload.name,
      googleId: payload.sub,
      email_verified: payload.email_verified,
      exp: new Date(payload.exp * 1000).toISOString()
    });

    const { sub: googleId, email, name, picture, email_verified } = payload;

    // Find or create user
    let user = await User.findOne({ 
      $or: [{ googleId }, { email }] 
    });

    if (!user) {
      console.log("🆕 Creating new user:", email);
      
      // Create new user without password
      user = new User({
        name,
        email,
        googleId,
        provider: "google",
        isEmailVerified: email_verified || true,
        avatar: picture,
      });
      await user.save();
      console.log("✅ New user created:", user._id);
    } else {
      console.log("📝 Updating existing user:", user._id);
      
      // Update existing user
      if (user.phone && !/^[6-9]\d{9}$/.test(user.phone)) {
        user.phone = null;
      }
      if (!user.googleId) {
        user.googleId = googleId;
        user.provider = "google";
      }
      if (!user.avatar && picture) {
        user.avatar = picture;
      }
      await user.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save();

    console.log("✅ Login successful for:", email);
    console.log("🔑 Access token generated");

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
    console.error("❌ Error stack:", error.stack);
    
    // Send more specific error message
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

// ✅ 3. GOOGLE CALLBACK HANDLER (for redirect flow)
const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
    }

    console.log("📡 Received Google callback with code");
    
    // Exchange code for tokens
    const { tokens } = await client.getToken({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    });

    console.log("✅ Tokens received from Google");

    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    // Here you would create/find user and generate your own JWT
    // Similar to googleOneTapLogin but with tokens from redirect flow
    
    // For now, redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}/login?success=true`);
    
  } catch (error) {
    console.error("❌ Google Callback Error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};

module.exports = { 
  googleOneTapLogin,
  getGoogleAuthUrl,
  googleCallback
};