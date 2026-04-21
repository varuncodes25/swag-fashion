const {
  signup,
  login,
  // adminSignup,
  // adminLogin,
  // resetPasword,
  forgotPassword,
  refreshToken,
  logout,
  changePassword,
  getProfile,
  updateProfile,
} = require("../controllers/authController");
const {
  getGoogleAuthUrl,
  googleCallback,
  googleOneTapLogin,
} = require("../controllers/googleAuthController");
const verifyToken = require("../middlewares/verifyToken");
const decryptRequest = require("../utils/decryptResponse");
const { buildLimiter, toNumber } = require("../utils/rateLimitConfig");
const router = require("express").Router();

const authLimiter = buildLimiter({
  envPrefix: "AUTH",
  windowMs: toNumber(process.env.AUTH_LIMIT_WINDOW_MS, 10 * 60 * 1000),
  max: toNumber(process.env.AUTH_LIMIT_MAX, 30),
  message: { message: "Too many auth requests. Try again later." },
});

const loginLimiter = buildLimiter({
  envPrefix: "LOGIN",
  windowMs: toNumber(process.env.LOGIN_LIMIT_WINDOW_MS, 10 * 60 * 1000),
  max: toNumber(process.env.LOGIN_LIMIT_MAX, 5),
  message: { message: "Too many login attempts. Try again in 10 minutes." },
});

const signupLimiter = buildLimiter({
  envPrefix: "SIGNUP",
  windowMs: toNumber(process.env.SIGNUP_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  max: toNumber(process.env.SIGNUP_LIMIT_MAX, 5),
  message: { message: "Too many signup attempts. Try again in 15 minutes." },
});

router.post("/signup", signupLimiter, decryptRequest, signup);

router.post("/login", loginLimiter, decryptRequest, login);

router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/auth/refresh-token", authLimiter, refreshToken);
router.get("/auth/google/url", getGoogleAuthUrl);
router.get("/auth/google/callback", googleCallback);
router.post("/auth/google/token", authLimiter, googleOneTapLogin);
// router.post("/reset-password/:token", resetPasword);

router.post("/logout", authLimiter, logout);
router.post("/change-password", authLimiter, verifyToken, changePassword);
router.get("/users/profile", authLimiter, verifyToken, getProfile);
router.put("/users/profile", verifyToken, decryptRequest, updateProfile);
// router.post("/admin-signup", adminSignup);

// router.post("/admin-login", adminLogin);

module.exports = router;
