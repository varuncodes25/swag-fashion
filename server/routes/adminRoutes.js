const { adminSignup, adminLogin } = require("../controllers/adminController");
const decryptRequest = require("../utils/decryptResponse");

const router = require("express").Router();




router.post("/admin-signup", adminSignup);

router.post("/admin-login",decryptRequest, adminLogin);

module.exports = router;
