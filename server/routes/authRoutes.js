const {
  signup,
  login,
  // adminSignup,
  // adminLogin,
  // resetPasword,
  forgotPassword,
} = require("../controllers/authController");
const { getGoogleAuthUrl, googleCallback, googleOneTapLogin } = require("../controllers/googleAuthController");
const decryptRequest = require("../utils/decryptResponse");
const router = require("express").Router();

router.post("/signup",decryptRequest, signup);

router.post("/login",decryptRequest, login);

router.post("/forgot-password", forgotPassword);

router.get('/auth/google/url', getGoogleAuthUrl);
router.get('/auth/google/callback', googleCallback);
router.post('/auth/google/token', googleOneTapLogin);
// router.post("/reset-password/:token", resetPasword);


// router.post("/admin-signup", adminSignup);

// router.post("/admin-login", adminLogin);

module.exports = router;
