const {
  signup,
  login,
  adminSignup,
  adminLogin,
  resetPasword,
  forgotPassword,
} = require("../controllers/authController");
const router = require("express").Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPasword);


router.post("/admin-signup", adminSignup);

router.post("/admin-login", adminLogin);

module.exports = router;
