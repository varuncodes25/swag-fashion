// middlewares/multer.js

const multer = require('multer');
const path = require('path');

// Use memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype || extname) {
    return cb(null, true);
  }
  cb(new Error("Only image files are allowed (jpeg, png, gif, webp)"));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB per image (keep in sync with client/src/constants/uploadLimits.js)
    files: 40,
  },
});

module.exports = upload;