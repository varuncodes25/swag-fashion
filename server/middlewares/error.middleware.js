// server/middlewares/error.middleware.js
const { ApiError } = require("../utils/handlar/ApiError");

// ✅ Main Error Handler
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.log("❌ Error:", err);

  // 1️⃣ Mongoose Validation Errors
  if (err.name === "ValidationError") {
    const errors = [];
    Object.keys(err.errors).forEach(key => {
      errors.push({
        field: key,
        message: err.errors[key].message
      });
    });
    
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors
    });
  }

  // 2️⃣ Duplicate Key Error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
      errors: [{
        field: field,
        message: `${field === 'email' ? 'Email' : 'Phone number'} is already registered`
      }]
    });
  }

  // 3️⃣ Cast Error (Invalid ID)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
      errors: [{
        field: err.path,
        message: `Invalid ${err.path} format`
      }]
    });
  }

  // 4️⃣ JWT Errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      errors: [{ message: "Please login again" }]
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
      errors: [{ message: "Please login again" }]
    });
  }

  // 5️⃣ Custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors
    });
  }

  // 6️⃣ Default Server Error
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    errors: [{ message: err.message }],
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

// ✅ 404 Not Found Middleware
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found - ${req.originalUrl}`);
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};