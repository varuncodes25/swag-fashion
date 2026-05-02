const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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
  UnauthorizedError,
} = require("../utils/handlar/ApiError");
const { default: mongoose } = require("mongoose");

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

// ============ USER SIGNUP ============
const signup = asyncHandler(async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists by email
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return next(new DuplicateError("Email"));
    }

    if (phone) {
      const existingPhone = await userRepository.findByPhone(phone);
      if (existingPhone) {
        return next(new DuplicateError("Phone number"));
      }
    }

    const userPayload = {
      name,
      email,
      password,
      isEmailVerified: true,
    };
    if (phone) {
      userPayload.phone = phone;
    }
    const user = await userRepository.create(userPayload);

    let userEmailSent = false;
    let adminEmailSent = false;
    const hasSmtp = sendMail.isConfigured?.() === true;
    const adminTo =
      process.env.ADMIN_RECEIVER?.trim() ||
      process.env.GMAIL_USER?.trim() ||
      null;

    if (hasSmtp) {
      const frontendBase =
        (
          process.env.FRONTEND_URL ||
          process.env.CLIENT_URL ||
          ""
        ).replace(/\/$/, "") || "https://swagfashion.in";
      const support =
        process.env.SUPPORT_EMAIL ||
        process.env.MAIL_FROM ||
        process.env.GMAIL_USER ||
        process.env.ADMIN_RECEIVER;
      const safeName = escapeHtml(name);
      const safeEmail = escapeHtml(email);

      try {
        const userHtml = welcomeEmailTemplate(
          safeName,
          frontendBase,
          support,
        );
        await sendMail(email, "Welcome to Swag Fashion", userHtml);
        userEmailSent = true;
      } catch (err) {
        console.error("signup → user email failed:", err.message);
      }

      if (adminTo) {
        try {
          const phoneLine = phone
            ? `<p><strong>Phone:</strong> ${escapeHtml(String(phone))}</p>`
            : "";
          const adminHtml = `
            <h2>New signup — Swag Fashion</h2>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            ${phoneLine}
            <p><strong>User ID:</strong> ${escapeHtml(String(user._id))}</p>
          `;
          await sendMail(
            adminTo,
            `[Swag Fashion] New signup: ${String(email).slice(0, 80)}`,
            adminHtml,
          );
          adminEmailSent = true;
        } catch (err) {
          console.error("signup → admin email failed:", err.message);
        }
      }
    } else {
      console.warn(
        "signup: mail not configured (Brevo or Gmail) — signup emails skipped",
      );
    }

    const response = new ApiResponse(
      201,
      { userId: user._id, userEmailSent, adminEmailSent },
      "Registration successful!",
    );

    return res.status(201).json(await encryptResponse(response));
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
      return next(
        new ValidationError({
          email: !email ? "Email is required" : undefined,
          password: !password ? "Password is required" : undefined,
        }),
      );
    }

    // Get user with password field
    const user = await userRepository.findByEmail(email, true);

    if (!user) {
      return next(new UnauthorizedError("Invalid email or password"));
    }

    // ✅ NEW: Check if user is Google-only
    if (user.provider === "google" && !user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account was created with Google. Please login with Google or set a password first.",
        needsPasswordSetup: true,
        provider: "google",
        email: user.email,
      });
    }

    // ✅ NEW: Check if user has password (for 'both' provider)
    if (!user.password) {
      return next(
        new UnauthorizedError(
          "No password set for this account. Please use Google login.",
        ),
      );
    }

    // Check if account is locked
    if (user.isLocked) {
      const lockTimeLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return next(
        new UnauthorizedError(
          `Account locked. Try again in ${lockTimeLeft} minutes`,
        ),
      );
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await userRepository.incrementLoginAttempts(user._id);
      const updatedUser = await userRepository.findByEmail(email, true);

      const attemptsLeft = Math.max(0, 5 - updatedUser.loginAttempts);
      const message =
        attemptsLeft > 0
          ? `Invalid credentials. ${attemptsLeft} attempts left.`
          : "Too many failed attempts. Account locked for 30 minutes.";

      return next(new UnauthorizedError(message));
    }

    // Reset login attempts
    await userRepository.resetLoginAttempts(user._id);

    // ✅ NEW: Update provider if needed
    if (user.provider === "google") {
      user.provider = "both";
      await user.save();
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Add device info
    const deviceData = {
      deviceId:
        req.headers["device-id"] || req.headers["user-agent"] || "unknown",
      deviceName: req.headers["device-name"] || "Unknown Device",
      platform: req.headers["platform"] || "web",
    };
    await userRepository.addDeviceInfo(user._id, deviceData, refreshToken);

    // Update last login
    await userRepository.updateLastLogin(
      user._id,
      req.ip || req.connection.remoteAddress,
    );

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      avatar: user.avatar,
      provider: user.provider, // ✅ Send provider info
    };

    const response = new ApiResponse(
      200,
      {
        token: accessToken,
        refreshToken,
        user: userData,
      },
      "Login successful",
    );

    return res.status(200).json(await encryptResponse(response));
  } catch (error) {
    next(error);
  }
});
// controllers/authController.js - Add this new function

const setPasswordForGoogleUser = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new ValidationError({
          email: !email ? "Email is required" : undefined,
          password: !password ? "Password is required" : undefined,
        }),
      );
    }

    if (password.length < 8) {
      return next(
        new ValidationError({
          password: "Password must be at least 8 characters",
        }),
      );
    }

    const user = await userRepository.findByEmail(email, true);

    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    // ✅ Check if user is Google-only
    if (user.provider !== "google" && user.provider !== "both") {
      return next(new UnauthorizedError("This account already has a password"));
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.provider = user.provider === "google" ? "both" : user.provider;

    await user.save();

    const response = new ApiResponse(
      200,
      null,
      "Password set successfully. You can now login with email/password.",
    );
    return res.json(await encryptResponse(response));
  } catch (error) {
    next(error);
  }
});
// ============ REFRESH TOKEN ============
const refreshToken = asyncHandler(async (req, res) => {
  console.log("🔄 Refresh token function called");

  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      const response = new ApiResponse(400, null, "Refresh token required");
      return res.status(400).json(await encryptResponse(response));
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      const message =
        err.name === "TokenExpiredError"
          ? "Refresh token expired"
          : "Invalid refresh token";
      const response = new ApiResponse(401, null, message);
      return res.status(401).json(await encryptResponse(response));
    }

    // Get user with refresh token
    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user) {
      const response = new ApiResponse(401, null, "User not found");
      return res.status(401).json(await encryptResponse(response));
    }

    // Check refresh token match (for DB option)
    if (user.refreshToken && user.refreshToken !== refreshToken) {
      const response = new ApiResponse(401, null, "Invalid session");
      return res.status(401).json(await encryptResponse(response));
    }

    // Generate new tokens
    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    // Update refresh token in DB (for DB option)
    user.refreshToken = newRefreshToken;
    await user.save();

    // ✅ EXACT SAME FORMAT AS LOGIN
    const response = new ApiResponse(
      200,
      {
        token: newAccessToken,
        refreshToken: newRefreshToken,
      },
      "Token refreshed successfully",
    );

    return res.status(200).json(await encryptResponse(response));
  } catch (error) {
    console.error("Refresh token error:", error);
    const response = new ApiResponse(500, null, "Internal server error");
    return res.status(500).json(await encryptResponse(response));
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
      return next(
        new ValidationError({
          email: "Email is required",
        }),
      );
    }

    const user = await userRepository.findByEmail(email);

    if (!user) {
      // Don't reveal if user exists or not for security
      const response = new ApiResponse(
        200,
        null,
        "If your email is registered, you will receive a password reset link.",
      );
      return res.json(await encryptResponse(response));
    }

    const resetToken = await userRepository.generateResetToken(user._id);
    const frontendBase = (
      process.env.FRONTEND_URL ||
      process.env.CLIENT_URL ||
      ""
    ).replace(/\/$/, "");
    const resetLink = `${frontendBase}/reset-password/${resetToken}`;

    if (!sendMail.isConfigured?.()) {
      console.warn("forgot-password: SMTP not configured");
      return res.status(503).json(
        await encryptResponse(
          new ApiResponse(
            503,
            null,
            "Password reset email is not available (mail not configured on server).",
          ),
        ),
      );
    }

    try {
      await sendMail(
        user.email,
        "Password reset — Swag Fashion",
        `<p>Click below to reset your password (expires in 15 minutes):</p>
         <p><a href="${resetLink}">Reset password</a></p>
         <p>If the link does not work, copy this URL:<br/>${resetLink}</p>`,
      );
    } catch (mailErr) {
      console.error("forgot-password sendMail:", mailErr.message);
      return res.status(503).json(
        await encryptResponse(
          new ApiResponse(
            503,
            null,
            "Could not send reset email. Try again later or contact support.",
          ),
        ),
      );
    }

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
      return next(
        new ValidationError({
          password: "Password is required",
        }),
      );
    }

    if (password.length < 8) {
      return next(
        new ValidationError({
          password: "Password must be at least 8 characters",
        }),
      );
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userRepository.findByResetToken(hashedToken);

    if (!user) {
      return next(
        new ValidationError({
          token: "Invalid or expired token",
        }),
      );
    }

    await userRepository.changePassword(user._id, password);

    if (sendMail.isConfigured?.()) {
      try {
        await sendMail(
          user.email,
          "Password changed — Swag Fashion",
          "<p>Your password was changed successfully. If you did not do this, contact support immediately.</p>",
        );
      } catch (mailErr) {
        console.error("reset-password confirmation email:", mailErr.message);
      }
    }

    const response = new ApiResponse(200, null, "Password reset successfully");
    return res.json(await encryptResponse(response));
  } catch (error) {
    next(error);
  }
});

// ============ CHANGE PASSWORD ============
const changePassword = asyncHandler(async (req, res, next) => {
  try {
    console.log("📥 Request body:", req.body);
    
    // ✅ Support both field name formats (oldPassword OR currentPassword)
    const currentPassword = req.body.currentPassword || req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;
    
    const userId =  req.id; // ✅ Support both userId formats
    console.log("👤 User ID:", userId);

    // ✅ Validation 1: Check required fields
    if (!newPassword) {
      return next(
        new ValidationError({
          newPassword: "New password is required",
        }),
      );
    }

    // ✅ Validation 2: Check if new password matches confirm password
    if (confirmPassword && newPassword !== confirmPassword) {
      return next(
        new ValidationError({
          confirmPassword: "New password and confirm password do not match",
        }),
      );
    }

    // ✅ Validation 3: Password length check
    // if (newPassword.length < 8) {
    //   return next(
    //     new ValidationError({
    //       newPassword: "Password must be at least 8 characters",
    //     }),
    //   );
    // }

    // ✅ Get user from database (include password field)
    const user = await userRepository.findById(userId, true);
    
    console.log("👤 User found:", {
      id: user._id,
      email: user.email,
      provider: user.provider,
      hasPassword: !!user.password
    });

    if (!user) {
      return next(new UnauthorizedError("User not found"));
    }

    // ✅ CRITICAL: Handle Google users
    if (user.provider === 'google' && !user.password) {
      // Google user setting password for first time
      if (!currentPassword) {
        // No current password needed - first time setup
        await userRepository.changePassword(userId, newPassword);
        
        // Optional: Update provider to local if needed
        if (userRepository.updateProvider) {
          await userRepository.updateProvider(userId, 'local');
        }
        
        const response = new ApiResponse(
          200,
          null,
          "Password set successfully! You can now login with password.",
        );
        return res.json(await encryptResponse(response));
      } else {
        // Google user trying to change password with old password (not applicable)
        return next(new UnauthorizedError("Google users cannot change password. Use 'Set Password' option."));
      }
    }

    // ✅ For local users or users with existing password
    if (!user.password) {
      // User has no password (edge case)
      return next(new ValidationError({
        currentPassword: "You don't have a password set. Please use 'Forgot Password' option."
      }));
    }

    // ✅ Verify current password (only if provided and user has password)
    if (!currentPassword) {
      return next(
        new ValidationError({
          currentPassword: "Current password is required",
        }),
      );
    }

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return next(new UnauthorizedError("Current password is incorrect"));
    }

    // ✅ Check if new password is same as old
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return next(
        new ValidationError({
          newPassword: "New password cannot be the same as current password",
        }),
      );
    }

    // ✅ Change password
    await userRepository.changePassword(userId, newPassword);

    console.log("✅ Password changed successfully for user:", user.email);

    // ✅ Success response with encryption
    const response = new ApiResponse(
      200,
      null,
      "Password changed successfully",
    );
    return res.json(await encryptResponse(response));
    
  } catch (error) {
    console.error("❌ Change password error:", error);
    next(error);
  }
});

// ============ GET PROFILE ============
// controllers/userController.js
const getProfile = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.id;

    // ✅ Correct aggregation query
    const [userData] = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      
      // Orders lookup
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders'
        }
      },
      
      // ✅ Wishlist lookup from Wishlist model
      {
        $lookup: {
          from: 'wishlists',  // MongoDB collection name (usually lowercase plural)
          let: { userId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$user', '$$userId'] } } },
            {
              $lookup: {
                from: 'products',
                localField: 'product',
                foreignField: '_id',
                as: 'productDetails'
              }
            },
            { $unwind: '$productDetails' },
            { $replaceRoot: { newRoot: '$productDetails' } }
          ],
          as: 'wishlist'
        }
      },
      
      // Addresses lookup
      {
        $lookup: {
          from: 'addresses',
          localField: 'addresses',
          foreignField: '_id',
          as: 'addresses'
        }
      },
      
      // Add stats
      {
        $addFields: {
          'stats.totalOrders': { $size: '$orders' },
          'stats.totalSpent': { $sum: '$orders.totalAmount' },
          'stats.wishlistCount': { $size: '$wishlist' },
          'stats.addressesCount': { $size: '$addresses' }
        }
      },
      
      // Project hidden fields
      {
        $project: {
          password: 0,
          refreshToken: 0,
          __v: 0
        }
      }
    ]);

    if (!userData) {
      return next(new NotFoundError("User not found"));
    }

    // Sort orders
    userData.orders = userData.orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    const response = new ApiResponse(200, userData, "Profile fetched successfully");
    return res.json(await encryptResponse(response));
    
  } catch (error) {
    next(error);
  }
});

// ============ UPDATE PROFILE ============
// controllers/userController.js
const updateProfile = asyncHandler(async (req, res, next) => {
  try {
    console.log("=== UPDATE PROFILE CONTROLLER ===");
    console.log("1. req.userId:", req.userId);
    console.log("2. req.user:", req.user);
    console.log("3. req.body:", JSON.stringify(req.body, null, 2));
    console.log("4. Headers:", req.headers.authorization);
    
    const { name, phone } = req.body;
    const userId = req.id;
    
    // ✅ Direct database update for testing
    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found!");
      return next(new NotFoundError("User not found"));
    }
    
    console.log("5. Current user:", { id: user._id, name: user.name, phone: user.phone });
    
    // ✅ Direct assignment
    if (name) {
      user.name = name;
      console.log("6. Setting name to:", name);
    }
    if (phone) {
      user.phone = phone;
      console.log("7. Setting phone to:", phone);
    }
    
    // ✅ Save with error handling
    try {
      await user.save();
      console.log("8. User saved successfully!");
    } catch (saveError) {
      console.error("9. Save error:", saveError);
      throw saveError;
    }
    
    console.log("10. Updated user:", { id: user._id, name: user.name, phone: user.phone });
    
    const response = new ApiResponse(200, { name: user.name, phone: user.phone }, "Profile updated");
    return res.json(await encryptResponse(response));
    
  } catch (error) {
    console.error("❌ Update error:", error);
    next(error);
  }
});

// ============ TOGGLE WISHLIST ============
const toggleWishlist = asyncHandler(async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.userId;

    const user = await userRepository.toggleWishlist(userId, productId);

    const message = user.wishlist.includes(productId)
      ? "Added to wishlist"
      : "Removed from wishlist";

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

    const formattedSessions = sessions.map((device) => ({
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      platform: device.platform,
      lastActive: device.lastActive,
      isCurrentDevice: device.deviceId === req.headers["device-id"],
    }));

    // ✅ Success response with encryption
    const response = new ApiResponse(
      200,
      formattedSessions,
      "Sessions fetched successfully",
    );
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
      return next(
        new ValidationError({
          general: "Either email or phone is required",
        }),
      );
    }

    const otp = await userRepository.generateOTP(userId);

    if (email) {
      await sendMail(
        email,
        "Your OTP - Swag Fashion",
        `<p>Your OTP is: <strong>${otp}</strong></p>
         <p>This OTP expires in 10 minutes.</p>`,
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
      return next(
        new ValidationError({
          otp: "OTP is required",
        }),
      );
    }

    const isValid = await userRepository.verifyOTP(userId, otp);

    if (!isValid) {
      return next(
        new ValidationError({
          otp: "Invalid or expired OTP",
        }),
      );
    }

    // ✅ Success response with encryption
    const response = new ApiResponse(200, null, "OTP verified successfully");
    return res.json(await encryptResponse(response));
  } catch (error) {
    next(error);
  }
});
// ============ REFRESH TOKEN - FIXED ============

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  changePassword,
  getProfile,
  updateProfile,
  toggleWishlist,
  getSessions,
  requestOTP,
  verifyOTP,
  setPasswordForGoogleUser,
};
