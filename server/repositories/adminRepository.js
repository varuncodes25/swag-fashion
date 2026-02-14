const Admin = require("../models/Admin");

const adminRepository = {
  // Find by username
  findByUsername: async (username, includeSensitive = false) => {
    let query = Admin.findOne({ username });
    if (includeSensitive) {
      query = query.select("+password +refreshToken +loginAttempts +lockUntil");
    }
    return await query;
  },

  // Create admin
  create: async (adminData) => {
    const admin = new Admin(adminData);
    return await admin.save();
  },

  // Update admin
  update: async (id, updateData) => {
    return await Admin.findByIdAndUpdate(id, updateData, { new: true });
  },

  // Increment login attempts
  incrementLoginAttempts: async (adminId) => {
    const admin = await Admin.findById(adminId).select("+loginAttempts +lockUntil");
    if (!admin) return null;
    
    admin.loginAttempts = (admin.loginAttempts || 0) + 1;
    if (admin.loginAttempts >= 5) {
      admin.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
    await admin.save();
    return admin;
  },

  // Reset login attempts
  resetLoginAttempts: async (adminId) => {
    const admin = await Admin.findById(adminId).select("+loginAttempts +lockUntil");
    if (!admin) return null;
    
    admin.loginAttempts = 0;
    admin.lockUntil = null;
    await admin.save();
    return admin;
  },

  // Update refresh token
  updateRefreshToken: async (adminId, refreshToken) => {
    const admin = await Admin.findById(adminId);
    if (!admin) return null;
    
    admin.refreshToken = refreshToken;
    admin.lastLogin = new Date();
    await admin.save();
    return admin;
  }
};

module.exports = adminRepository;