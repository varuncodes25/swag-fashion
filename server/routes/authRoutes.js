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
const router = require("express").Router();

router.post("/signup", decryptRequest, signup);

router.post("/login", decryptRequest, login);

router.post("/forgot-password", forgotPassword);
router.post("/auth/refresh-token", refreshToken);
router.get("/auth/google/url", getGoogleAuthUrl);
router.get("/auth/google/callback", googleCallback);
router.post("/auth/google/token", googleOneTapLogin);
// router.post("/reset-password/:token", resetPasword);

router.post("/logout", logout);
router.post("/change-password",verifyToken, changePassword);
router.get("/users/profile",verifyToken, getProfile);
router.put("/users/profile", verifyToken, decryptRequest, updateProfile);
// router.post("/admin-signup", adminSignup);

// router.post("/admin-login", adminLogin);

module.exports = router;
