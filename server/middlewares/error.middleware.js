// server/middlewares/error.middleware.js
const { ApiError } = require("../utils/handlar/ApiError");
const { logger } = require("../utils/logger");

/** Render / dev: put error details in JSON + logs. Set HIDE_ERROR_DETAILS=true on Render to turn off response extras. */
function exposeErrorDetails() {
  if (process.env.HIDE_ERROR_DETAILS === "true") return false;
  return (
    process.env.NODE_ENV === "development" ||
    process.env.RENDER === "true"
  );
}

function attachDebugPayload(payload, err) {
  if (!exposeErrorDetails()) return payload;
  return {
    ...payload,
    debug: {
      name: err.name,
      message: err.message,
      code: err.code != null ? err.code : undefined,
      status: err.status != null ? err.status : undefined,
      path: err.path,
      stack: err.stack,
    },
  };
}

// ✅ Main Error Handler
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  logger.error({
    type: "unhandled_error",
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    requestId: req.requestId || null,
    timestamp: new Date().toISOString(),
  });

  if (exposeErrorDetails()) {
    console.error(
      "[error]",
      req.method,
      req.originalUrl,
      err.name,
      err.message,
      err.code || "",
      "\n",
      err.stack || "",
    );
  }

  // 1️⃣ Mongoose Validation Errors
  if (err.name === "ValidationError") {
    const errors = [];
    Object.keys(err.errors).forEach(key => {
      errors.push({
        field: key,
        message: err.errors[key].message
      });
    });
    
    return res.status(400).json(
      attachDebugPayload(
        {
          success: false,
          message: "Validation failed",
          errors: errors,
        },
        err,
      ),
    );
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
    return res.status(400).json(
      attachDebugPayload(
        {
          success: false,
          message: "Invalid ID format",
          errors: [
            {
              field: err.path,
              message: `Invalid ${err.path} format`,
            },
          ],
        },
        err,
      ),
    );
  }

  // 4️⃣ JWT Errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json(
      attachDebugPayload(
        {
          success: false,
          message: "Invalid token",
          errors: [{ message: "Please login again" }],
        },
        err,
      ),
    );
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json(
      attachDebugPayload(
        {
          success: false,
          message: "Token expired",
          errors: [{ message: "Please login again" }],
        },
        err,
      ),
    );
  }

  // 5️⃣ Custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(
      attachDebugPayload(
        {
          success: false,
          message: err.message,
          errors: err.errors,
        },
        err,
      ),
    );
  }

  // 6️⃣ Default Server Error
  const status = Number(err.statusCode || err.status) || 500;
  const safeStatus = status >= 400 && status < 600 ? status : 500;
  return res.status(safeStatus).json(
    attachDebugPayload(
      {
        success: false,
        message: exposeErrorDetails() ? err.message : "Internal server error",
        errors: [{ message: err.message }],
      },
      err,
    ),
  );
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