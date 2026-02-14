const User = require("../models/User");
const crypto = require('crypto');

const userRepository = {
  // Find by email
  findByEmail: async (email, includePassword = false) => {
    let query = User.findOne({ email });
    if (includePassword) {
      query = query.select("+password +loginAttempts +lockUntil +refreshToken +otp +otpExpiry");
    }
    return await query;
  },

  // Find by ID
  findById: async (id, includeSensitive = false) => {
    let query = User.findById(id);
    if (includeSensitive) {
      query = query.select("+password +otp +otpExpiry +refreshToken");
    }
    return await query;
  },

  // Create user
  create: async (userData) => {
    const user = new User(userData);
    return await user.save();
  },

  // Update user
  update: async (id, updateData) => {
    return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  },

  // Find by verification token
  findByVerificationToken: async (hashedToken) => {
    return await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });
  },

  // Find by refresh token
  findByRefreshToken: async (refreshToken) => {
    return await User.findOne({ refreshToken });
  },

  // Find by reset token
  findByResetToken: async (hashedToken) => {
    return await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
  },

  // Get profile with populated fields
  getProfile: async (id) => {
    return await User.findById(id)
      .select("-__v -password -refreshToken")
      .populate("addresses")
      .populate("wishlist", "name price images");
  },

  // Toggle wishlist
  toggleWishlist: async (userId, productId) => {
    const user = await User.findById(userId);
    if (!user) return null;
    
    await user.toggleWishlist(productId);
    return user;
  },

  // Add device info
  addDeviceInfo: async (userId, deviceData, refreshToken) => {
    const user = await User.findById(userId);
    if (!user) return null;
    
    await user.addDeviceInfo(deviceData, refreshToken);
    return user;
  },

  // Remove device
  removeDevice: async (userId, deviceId) => {
    const user = await User.findById(userId);
    if (!user) return null;
    
    await user.removeDevice(deviceId);
    return user;
  },

  // Update last login
  updateLastLogin: async (userId, ip) => {
    const user = await User.findById(userId);
    if (!user) return null;
    
    await user.updateLastLogin(ip);
    return user;
  },

  // Increment login attempts
  incrementLoginAttempts: async (userId) => {
    const user = await User.findById(userId).select("+loginAttempts +lockUntil");
    if (!user) return null;
    
    await user.incrementLoginAttempts();
    return user;
  },

  // Reset login attempts
  resetLoginAttempts: async (userId) => {
    const user = await User.findById(userId).select("+loginAttempts +lockUntil");
    if (!user) return null;
    
    await user.resetLoginAttempts();
    return user;
  },

  // Generate email verification token
  generateVerificationToken: async (userId) => {
    const user = await User.findById(userId);
    if (!user) return null;
    
    const token = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    return token;
  },

  // Generate password reset token
  generateResetToken: async (userId) => {
    const user = await User.findById(userId);
    if (!user) return null;
    
    const token = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });
    return token;
  },

  // Verify email
  verifyEmail: async (userId) => {
    const user = await User.findById(userId);
    if (!user) return null;
    
    user.verifyEmail();
    await user.save({ validateBeforeSave: false });
    return user;
  },

  // Generate OTP
  generateOTP: async (userId) => {
    const user = await User.findById(userId).select("+otp +otpExpiry");
    if (!user) return null;
    
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });
    return otp;
  },

  // Verify OTP
  verifyOTP: async (userId, otp) => {
    const user = await User.findById(userId).select("+otp +otpExpiry");
    if (!user) return false;
    
    const isValid = user.verifyOTP(otp);
    if (isValid) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
    }
    return isValid;
  },

  // Change password
  changePassword: async (userId, newPassword) => {
    const user = await User.findById(userId).select("+password");
    if (!user) return null;
    
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    user.refreshToken = null;
    await user.save();
    return user;
  },

  // Update profile
  updateProfile: async (userId, updateData) => {
    const user = await User.findById(userId);
    if (!user) return null;
    
    const { name, phone, avatar, preferences } = updateData;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    
    await user.save();
    return user;
  },

  // Get sessions
  getSessions: async (userId) => {
    const user = await User.findById(userId).select("deviceInfo");
    return user?.deviceInfo || [];
  }
};

module.exports = userRepository;