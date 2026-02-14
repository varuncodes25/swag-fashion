const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminRepository = require("../repositories/adminRepository");
const ApiResponse = require("../utils/handlar/ApiResponse");
const asyncHandler = require("../utils/handlar/AsyncHandler");
const encryptResponse = require("../utils/encryptResponse");

// ============ ADMIN LOGIN ============
const adminLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const admin = await adminRepository.findByUsername(username, true);

  if (!admin) {
    const response = new ApiResponse(401, null, "Invalid credentials");
    return res.status(401).json(await encryptResponse(response));
  }

  // Check if account is locked
  if (admin.lockUntil && admin.lockUntil > Date.now()) {
    const lockTimeLeft = Math.ceil((admin.lockUntil - Date.now()) / 60000);
    const response = new ApiResponse(423, null, `Account locked. Try again in ${lockTimeLeft} minutes`);
    return res.status(423).json(await encryptResponse(response));
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);

  if (!isPasswordValid) {
    await adminRepository.incrementLoginAttempts(admin._id);
    
    const response = new ApiResponse(401, null, "Invalid credentials");
    return res.status(401).json(await encryptResponse(response));
  }

  // Reset login attempts
  await adminRepository.resetLoginAttempts(admin._id);
  
  // Generate tokens
  const accessToken = jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const refreshToken = jwt.sign(
    { id: admin._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  await adminRepository.updateRefreshToken(admin._id, refreshToken);

  const adminData = {
    id: admin._id,
    username: admin.username,
    role: admin.role,
    permissions: admin.permissions
  };

  const response = new ApiResponse(200, { token: accessToken, refreshToken, user: adminData }, "Admin logged in successfully");
  return res.status(200).json(await encryptResponse(response));
});

// ============ ADMIN SIGNUP ============
const adminSignup = asyncHandler(async (req, res) => {
  const { username, password, secretKey, role = "admin", permissions = [] } = req.body;

  // Verify secret key for admin creation
  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    const response = new ApiResponse(403, null, "Unauthorized: Invalid secret key");
    return res.status(403).json(await encryptResponse(response));
  }

  const existingAdmin = await adminRepository.findByUsername(username);

  if (existingAdmin) {
    const response = new ApiResponse(400, null, "Username already exists");
    return res.status(400).json(await encryptResponse(response));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await adminRepository.create({
    username,
    password: hashedPassword,
    role,
    permissions
  });

  const response = new ApiResponse(201, null, "Admin created successfully");
  return res.status(201).json(await encryptResponse(response));
});

// ============ ADMIN REFRESH TOKEN ============
const adminRefreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    const response = new ApiResponse(401, null, "Refresh token required");
    return res.status(401).json(await encryptResponse(response));
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  
  const admin = await adminRepository.findByUsername(decoded.username, true);

  if (!admin || admin.refreshToken !== token) {
    const response = new ApiResponse(403, null, "Invalid refresh token");
    return res.status(403).json(await encryptResponse(response));
  }

  // Generate new tokens
  const newAccessToken = jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const newRefreshToken = jwt.sign(
    { id: admin._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  await adminRepository.updateRefreshToken(admin._id, newRefreshToken);

  const response = new ApiResponse(200, { token: newAccessToken, refreshToken: newRefreshToken }, "Token refreshed successfully");
  res.json(await encryptResponse(response));
});

// ============ ADMIN LOGOUT ============
const adminLogout = asyncHandler(async (req, res) => {
  const adminId = req.userId;

  await adminRepository.updateRefreshToken(adminId, null);

  const response = new ApiResponse(200, null, "Logged out successfully");
  res.json(await encryptResponse(response));
});

module.exports = {
  adminLogin,
  adminSignup,
  adminRefreshToken,
  adminLogout
};