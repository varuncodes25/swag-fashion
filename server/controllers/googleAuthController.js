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

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture, email_verified } = payload;

    // Find or create user
    let user = await User.findOne({ 
      $or: [{ googleId }, { email }] 
    });

    if (!user) {
      // Create new user
      const randomPassword = Math.random().toString(36) + Date.now().toString();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = new User({
        name,
        email,
        googleId,
        provider: "google",
        isEmailVerified: email_verified || true,
        avatar: picture,
        password: hashedPassword
      });
      await user.save();
    } else {
      // Update existing user
      if (user.phone && !/^[6-9]\d{9}$/.test(user.phone)) {
        user.phone = null;
      }
      if (!user.googleId) {
        user.googleId = googleId;
        user.provider = "google";
      }
      await user.save();
    }

    user.lastLogin = new Date();
    await user.save();

    // ✅ FIXED: Use the model method!
    const accessToken = user.generateAccessToken();  // 👈 YEH USE KARO
    const refreshToken = user.generateRefreshToken(); // 👈 YEH BHI

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Send response
    res.json({
      success: true,
      token: accessToken,        // 👈 Access token
      refreshToken: refreshToken, // 👈 Refresh token
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
      message: "Google login failed. Please try again." 
    });
  }
};

// ✅ 2. GET GOOGLE AUTH URL (for redirect flow)
// authController.js - getGoogleAuthUrl
// authController.js - getGoogleAuthUrl
const getGoogleAuthUrl = async (req, res) => {
  try {
    console.log("📡 Backend generating Google URL");
    
    // ✅ FIXED: Properly encode all parameters
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: 'code',  // ✅ Yahi missing tha
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
    
    // Exchange code for tokens
    // You'll need to implement this part
    // For now, redirect to frontend
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