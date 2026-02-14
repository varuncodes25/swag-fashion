const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');

const userRepository = require("../repositories/userRepository");
const ApiResponse = require("../utils/handlar/ApiResponse");
const asyncHandler = require("../utils/handlar/AsyncHandler");
const encryptResponse = require("../utils/encryptResponse");
const sendMail = require("../utils/mailer");
const { welcomeEmailTemplate } = require("../utils/userTemplate");
const { 
  DuplicateError, 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError 
} = require("../utils/handlar/ApiError");

// ============ USER SIGNUP ============
const signup = asyncHandler(async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return next(new DuplicateError("Email"));
    }

    // Create new user
    const user = await userRepository.create({ name, email, phone, password });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendMail(
      email,
      "Verify Your Email - Swag Fashion",
      `<h2>Welcome to Swag Fashion! 🎉</h2>
       <p>Hi ${name},</p>
       <p>Please verify your email address:</p>
       <a href="${verificationLink}">Verify Email</a>`
    );

    // Send welcome email
    const userHtml = welcomeEmailTemplate(
      name,
      process.env.FRONTEND_URL,
      process.env.SUPPORT_EMAIL
    );
    await sendMail(email, "🎉 Welcome to Swag Fashion!", userHtml);

    // ✅ Success response with encryption
    const response = new ApiResponse(201, { userId: user._id }, "Registration successful! Please verify your email.");
    return res.status(201).json(await encryptResponse(response));

  } catch (error) {
    next(error);
  }
});

// ============ VERIFY EMAIL ============
const verifyEmail = asyncHandler(async (req, res, next) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await userRepository.findByVerificationToken(hashedToken);

    if (!user) {
      return next(new ValidationError({
        token: "Invalid or expired verification token"
      }));
    }

    await userRepository.verifyEmail(user._id);

    // ✅ Success response with encryption
    const response = new ApiResponse(200, null, "Email verified successfully! You can now login.");
    return res.json(await encryptResponse(response));
  } catch (error) {
    next(error);
  }
});

// ============ USER LOGIN ============
const login = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return next(new ValidationError({
        email: !email ? "Email is required" : undefined,
        password: !password ? "Password is required" : undefined
      }));
    }

    // Get user with password field
    const user = await userRepository.findByEmail(email, true);

    if (!user) {
      return next(new UnauthorizedError("Invalid email or password"));
    }

    // Check if account is locked
    if (user.isLocked) {
      const lockTimeLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return next(new UnauthorizedError(`Account locked. Try again in ${lockTimeLeft} minutes`));
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await userRepository.incrementLoginAttempts(user._id);
      const updatedUser = await userRepository.findByEmail(email, true);
      
      const attemptsLeft = Math.max(0, 5 - updatedUser.loginAttempts);
      const message = attemptsLeft > 0 
        ? `Invalid credentials. ${attemptsLeft} attempts left.`
        : "Too many failed attempts. Account locked for 30 minutes.";
      
      return next(new UnauthorizedError(message));
    }

    // Reset login attempts
    await userRepository.resetLoginAttempts(user._id);

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Add device info
    const deviceData = {
      deviceId: req.headers["device-id"] || req.headers["user-agent"] || "unknown",
      deviceName: req.headers["device-name"] || "Unknown Device",
      platform: req.headers["platform"] || "web"
    };
    await userRepository.addDeviceInfo(user._id, deviceData, refreshToken);

    // Update last login
    await userRepository.updateLastLogin(user._id, req.ip || req.connection.remoteAddress);

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      avatar: user.avatar
    };

    // ✅ Success response with encryption
    const response = new ApiResponse(200, { token: accessToken, refreshToken, user: userData }, "Login successful");
    return res.status(200).json(await encryptResponse(response));
  } catch (error) {
    next(error);
  }
});

// ============ REFRESH TOKEN ============
const refreshToken = asyncHandler(async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return next(new ValidationError({
        refreshToken: "Refresh token required"
      }));
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    // Find user by refresh token
    const user = await userRepository.findByRefreshToken(token);

    if (!user) {
      return next(new UnauthorizedError("Invalid refresh token"));
    }

    // Generate new tokens
    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    // Update refresh token in DB
    user.refreshToken = newRefreshToken;
    await user.save();

    // ✅ Success response with encryption
    const response = new ApiResponse(200, { token: newAccessToken, refreshToken: newRefreshToken }, "Token refreshed successfully");
    return res.json(await encryptResponse(response));
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Invalid or expired refresh token"));
    }
    next(error);
  }
});

// ============ LOGOUT ============
const logout = asyncHandler(async (req, res, next) => {
  try {
    const { deviceId } = req.body;
    const userId = req.userId;

    if (deviceId) {
      await userRepository.removeDevice(userId, deviceId);
    } else {
      const user = await userRepository.findById(userId);
      user.refreshToken = null;
      user.deviceInfo = [];
      await user.save();
    }

    // ✅ Success response with encryption
    const response = new ApiResponse(200, null, "Logged out successfully");
    return res.json(await encryptResponse(response));
  } catch (error) {
    next(error);
  }
});

// ============ FORGOT PASSWORD ============
const forgotPassword = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ValidationError({
        email: "Email is required"
      }));
    }

    const user = await userRepository.findByEmail(email);
    
    if (!user) {
      // Don't reveal if user exists or not for security
      const response = new ApiResponse(200, null, "If your email is registered, you will receive a password reset link.");
      return res.json(await encryptResponse(response));
    }

    // Generate password reset token
    const resetToken = await userRepository.generateResetToken(user._id);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    await sendMail(
      user.email,
      "Password Reset - Swag Fashion",
      `<p>Click below to reset your password:</p>
       <a href="${resetLink}">Reset Password</a>
       <p>This link expires in 15 minutes.</p>`
    );

    // ✅ Success response with encryption
    const response = new ApiResponse(200, null, "Password reset email sent");
    return res.json(await encryptResponse(response));
  } catch (error) {
    next(error);
  }
});

// ============ RESET PASSWORD ============
const resetPassword = asyncHandler(async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return next(new ValidationError({
        password: "Password is required"
      }));
    }

    if (password.length < 8) {
      return next(new ValidationError({
        password: "Password must be at least 8 characters"
      }));
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await userRepository.findByResetToken(hashedToken);

    if (!user) {
      return next(new ValidationError({
        token: "Invalid or expired token"
      }));
    }

    // Change password
    await userRepository.changePassword(user._id, password);

    // Send confirmation email
    await sendMail(
      user.email,
      "Password Reset Successful",
      "<p>Your password has been changed successfully.</p>"
    );

    // ✅ Success response with encryption
    const response = new ApiResponse(200, null, "Password reset successfully");
    return res.json(await encryptResponse(response));
  } catch (error) {
    next(error);
  }
});

// ============ CHANGE PASSWORD ============
const changePassword = asyncHandler(async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!currentPassword || !newPassword) {
      return next(new ValidationError({
        currentPassword: !currentPassword ? "Current password is required" : undefined,
        newPassword: !newPassword ? "New password is required" : undefined
      }));
    }

    if (newPassword.length < 8) {
      return next(new ValidationError({
        newPassword: "Password must be at least 8 characters"
      }));
    }

    const user = await userRepository.findById(userId, true);

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return next(new UnauthorizedError("Current password is incorrect"));
    }

    await userRepository.changePassword(userId, newPassword);

    // ✅ Success response with encryption
    const response = new ApiResponse(200, null, "Password changed successfully");
    return res.json(await encryptResponse(response));
  } catch (error) {
    next(error);
  }
});

// ============ GET PROFILE ============
const getProfile = asyncHandler(async (req, res, next) => {
  try {
    const user = await userRepository.getProfile(req.userId);

    if (!user) {
      return next(new NotFoundError("User"));
    }

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      addresses: user.addresses,
      wishlist: user.wishlist,
      preferences: user.preferences,
      createdAt: user.createdAt
    };

    // ✅ Success response with encryption
    const response = new ApiResponse(200, userData, "Profile fetched successfully");
    return res.json(await encryptResponse(response));
  } catch (error) {
    next(error);
  }
});

// ============ UPDATE PROFILE ============
const updateProfile = asyncHandler(async (req, res, next) => {
  try {
    const { name, phone, avatar, preferences } = req.body;
    const userId = req.userId;

    const user = await userRepository.updateProfile(userId, { name, phone, avatar, preferences });

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      preferences: user.preferences
    };

    // ✅ Success response with encryption
    const response = new ApiResponse(200, userData, "Profile updated successfully");
    return res.json(await encryptResponse(response));
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(new DuplicateError(field));
    }
    next(error);
  }
});

// ============ TOGGLE WISHLIST ============
const toggleWishlist = asyncHandler(async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.userId;

    const user = await userRepository.toggleWishlist(userId, productId);

    const message = user.wishlist.includes(productId) ? "Added to wishlist" : "Removed from wishlist";
    
    // ✅ Success response with encryption
    const response = new ApiResponse(200, { wishlist: user.wishlist }, message);
    return res.json(await encryptResponse(response));
  } catch (error) {
    next(error);
  }
});

// ============ GET SESSIONS ============
const getSessions = asyncHandler(async (req, res, next) => {
  try {
    const sessions = await userRepository.getSessions(req.userId);
    
    const formattedSessions = sessions.map(device => ({
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      platform: device.platform,
      lastActive: device.lastActive,
      isCurrentDevice: device.deviceId === req.headers["device-id"]
    }));

    // ✅ Success response with encryption
    const response = new ApiResponse(200, formattedSessions, "Sessions fetched successfully");
    return res.json(await encryptResponse(response));
  } catch (error) {
    next(error);
  }
});

// ============ REQUEST OTP ============
const requestOTP = asyncHandler(async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    const userId = req.userId;

    if (!email && !phone) {
      return next(new ValidationError({
        general: "Either email or phone is required"
      }));
    }

    const otp = await userRepository.generateOTP(userId);

    if (email) {
      await sendMail(
        email,
        "Your OTP - Swag Fashion",
        `<p>Your OTP is: <strong>${otp}</strong></p>
         <p>This OTP expires in 10 minutes.</p>`
      );
    }

    if (phone) {
      // Send SMS via your SMS provider
      // await sendSMS(phone, `Your OTP is: ${otp}`);
    }

    // ✅ Success response with encryption
    const response = new ApiResponse(200, null, "OTP sent successfully");
    return res.json(await encryptResponse(response));
  } catch (error) {
    next(error);
  }
});

// ============ VERIFY OTP ============
const verifyOTP = asyncHandler(async (req, res, next) => {
  try {
    const { otp } = req.body;
    const userId = req.userId;

    if (!otp) {
      return next(new ValidationError({
        otp: "OTP is required"
      }));
    }

    const isValid = await userRepository.verifyOTP(userId, otp);

    if (!isValid) {
      return next(new ValidationError({
        otp: "Invalid or expired OTP"
      }));
    }

    // ✅ Success response with encryption
    const response = new ApiResponse(200, null, "OTP verified successfully");
    return res.json(await encryptResponse(response));
  } catch (error) {
    next(error);
  }
});

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  verifyEmail,
  changePassword,
  getProfile,
  updateProfile,
  toggleWishlist,
  getSessions,
  requestOTP,
  verifyOTP
};