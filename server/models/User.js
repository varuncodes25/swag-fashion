const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const jwt = require("jsonwebtoken");

/* =====================================================
   USER SCHEMA - COMPLETE WITH ALL FIELDS & METHODS
===================================================== */

const userSchema = mongoose.Schema(
  {
    /* ========== BASIC INFO ========== */
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },
    
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email"
      ]
    },
    
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false // ✅ Don't return password by default
    },
    
    phone: {
      type: String,
      unique: true,
      sparse: true, // ✅ Allow null/undefined
      match: [
        /^[6-9]\d{9}$/,
        "Please enter a valid 10-digit Indian mobile number"
      ]
    },
    
    /* ========== ROLE & STATUS ========== */
    role: {
      type: String,
      default: "user",
      enum: {
        values: ["user", "seller", "moderator"],
        message: "Role must be either user, seller, or moderator"
      }
    },
    
    isActive: {
      type: Boolean,
      default: true
    },
    
    isDeleted: {
      type: Boolean,
      default: false,
      select: false
    },
    
    /* ========== AUTHENTICATION & SECURITY ========== */
    refreshToken: {
      type: String,
      default: null,
      select: false // ✅ Don't return by default
    },
    
    loginAttempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    
    lockUntil: {
      type: Date,
      default: null
    },
    
    lastLogin: {
      type: Date,
      default: null
    },
    
    lastLoginIP: {
      type: String,
      default: null,
      select: false
    },
    
    deviceInfo: [{
      deviceId: String,
      deviceName: String,
      platform: String,
      lastActive: { type: Date, default: Date.now },
      refreshToken: { type: String, select: false }
    }],
    
    passwordChangedAt: {
      type: Date,
      default: null
    },
    
    passwordResetToken: {
      type: String,
      select: false
    },
    
    passwordResetExpires: {
      type: Date,
      select: false
    },
    
    /* ========== EMAIL VERIFICATION ========== */
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    
    emailVerificationToken: {
      type: String,
      select: false
    },
    
    emailVerificationExpires: {
      type: Date,
      select: false
    },
    
    emailOtp: {
      type: String,
      select: false
    },
    
    emailOtpExpiry: {
      type: Date,
      select: false
    },
    
    /* ========== PHONE VERIFICATION ========== */
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    
    phoneOtp: {
      type: String,
      select: false
    },
    
    phoneOtpExpiry: {
      type: Date,
      select: false
    },
    
    /* ========== PURCHASE HISTORY ========== */
    purchasedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ],
    
    totalOrders: {
      type: Number,
      default: 0
    },
    
    totalSpent: {
      type: Number,
      default: 0
    },
    
    /* ========== WISHLIST ========== */
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ],
    
    /* ========== ADDRESSES ========== */
    addresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address"
      }
    ],
    
    defaultAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address"
    },
    
    /* ========== SOCIAL LOGIN ========== */
    googleId: {
      type: String,
      sparse: true,
      unique: true,
      select: false
    },
    
    facebookId: {
      type: String,
      sparse: true,
      unique: true,
      select: false
    },
    
    avatar: {
      type: String,
      default: "https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png"
    },
    
    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local"
    },
    
    /* ========== OTP (General Purpose) ========== */
    otp: {
      type: String,
      select: false
    },
    
    otpExpiry: {
      type: Date,
      select: false
    },
    
    /* ========== ACCOUNT SETTINGS ========== */
    preferences: {
      newsletter: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      emailNotifications: { type: Boolean, default: true },
      language: { type: String, default: "en" },
      currency: { type: String, default: "INR" }
    }
    
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/* =====================================================
   INDEXES - Performance Optimization
===================================================== */

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ facebookId: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ "deviceInfo.deviceId": 1 });

/* =====================================================
   VIRTUAL PROPERTIES
===================================================== */

// ✅ Check if account is locked
userSchema.virtual("isLocked").get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ✅ Check if online (last 5 minutes)
userSchema.virtual("isOnline").get(function() {
  return this.lastLogin && (Date.now() - this.lastLogin < 5 * 60 * 1000);
});

// ✅ Full name shortcut
userSchema.virtual("fullName").get(function() {
  return this.name;
});

// ✅ Account age in days
userSchema.virtual("accountAgeDays").get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

/* =====================================================
   INSTANCE METHODS
===================================================== */

// ✅ 1. Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ 2. Generate access token
userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );
};

// ✅ 3. Generate refresh token
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
};

// ✅ 4. Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// ✅ 5. Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  return token;
};

// ✅ 6. Generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

// ✅ 7. Verify OTP
userSchema.methods.verifyOTP = function(otp) {
  return this.otp === otp && this.otpExpiry > Date.now();
};

// ✅ 8. Increment login attempts
userSchema.methods.incrementLoginAttempts = function() {
  this.loginAttempts += 1;
  
  if (this.loginAttempts >= 5) {
    this.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
  }
  
  return this.save();
};

// ✅ 9. Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  this.loginAttempts = 0;
  this.lockUntil = null;
  return this.save();
};

// ✅ 10. Add purchased product
userSchema.methods.addPurchasedProduct = function(productId, amount) {
  if (!this.purchasedProducts.includes(productId)) {
    this.purchasedProducts.push(productId);
  }
  this.totalOrders += 1;
  this.totalSpent += amount;
  return this.save();
};

// ✅ 11. Toggle wishlist
userSchema.methods.toggleWishlist = function(productId) {
  const index = this.wishlist.indexOf(productId);
  if (index === -1) {
    this.wishlist.push(productId);
  } else {
    this.wishlist.splice(index, 1);
  }
  return this.save();
};

// ✅ 12. Add device info
userSchema.methods.addDeviceInfo = function(deviceData, refreshToken) {
  const existingDevice = this.deviceInfo.find(
    d => d.deviceId === deviceData.deviceId
  );
  
  if (existingDevice) {
    existingDevice.lastActive = Date.now();
    existingDevice.refreshToken = refreshToken;
  } else {
    this.deviceInfo.push({
      ...deviceData,
      refreshToken,
      lastActive: Date.now()
    });
  }
  
  return this.save();
};

// ✅ 13. Remove device
userSchema.methods.removeDevice = function(deviceId) {
  this.deviceInfo = this.deviceInfo.filter(d => d.deviceId !== deviceId);
  return this.save();
};

// ✅ 14. Update last login
userSchema.methods.updateLastLogin = function(ip) {
  this.lastLogin = Date.now();
  this.lastLoginIP = ip;
  return this.save();
};

// ✅ 15. Clear refresh token
userSchema.methods.clearRefreshToken = function() {
  this.refreshToken = null;
  return this.save();
};

/* =====================================================
   STATIC METHODS
===================================================== */

// ✅ 1. Find by email with password
userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email }).select('+password');
};

// ✅ 2. Find by refresh token
userSchema.statics.findByRefreshToken = function(refreshToken) {
  return this.findOne({ refreshToken }).select('+refreshToken');
};

// ✅ 3. Get active users count
userSchema.statics.getActiveUsersCount = function() {
  return this.countDocuments({ 
    isActive: true, 
    isDeleted: false,
    lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
  });
};

// ✅ 4. Bulk update user status
userSchema.statics.bulkUpdateStatus = function(userIds, isActive) {
  return this.updateMany(
    { _id: { $in: userIds } },
    { $set: { isActive } }
  );
};

/* =====================================================
   PRE MIDDLEWARE
===================================================== */

// ✅ Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Remove sensitive data before sending
userSchema.pre(/^find/, function(next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

/* =====================================================
   POST MIDDLEWARE
===================================================== */

// ✅ Log after user creation
// ✅ Log after user creation - ONLY for new users
userSchema.post('save', function(doc) {
  if (doc.isNew) {  // ✅ This will only run for new documents
    console.log(`📝 New user created: ${doc.email} at ${doc.createdAt}`);
  }
});

/* =====================================================
   EXPORT MODEL
===================================================== */

const User = mongoose.model("User", userSchema);
module.exports = User;