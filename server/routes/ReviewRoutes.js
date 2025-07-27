const {
  createReview,
  updateReview,
  deleteReview,
  getReviews,
  replyReview,
} = require("../controllers/ReviewController");
const verifyToken = require("../middlewares/verifyToken");
const router = require("express").Router();
const upload = require("../middlewares/multer");

router.post("/create-review", verifyToken, upload.array("images", 15), createReview);

router.put("/update-review/:id", verifyToken, updateReview);

router.delete("/delete-review/:id", verifyToken, deleteReview);

router.get("/get-reviews/:id", getReviews);

router.put("/reply-review/:id", verifyToken, replyReview);

module.exports = router;
