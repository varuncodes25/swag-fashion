const { addPincodes, getPincode } = require("../controllers/pincodeController");
const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");

router.post("/add-pincodes", verifyToken, addPincodes);

router.get("/get-pincode/:pincode", getPincode);

module.exports = router;
