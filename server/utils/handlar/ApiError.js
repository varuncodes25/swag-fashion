// server/utils/error.class.js
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.isOperational = true;  // Known errors
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends ApiError {
  constructor(errors) {
    super(400, "Validation failed", errors);
  }
}

class DuplicateError extends ApiError {
  constructor(field) {
    super(400, `${field} already exists`, [{ field, message: `${field} is already in use` }]);
  }
}

class NotFoundError extends ApiError {
  constructor(resource) {
    super(404, `${resource} not found`);
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized access") {
    super(401, message);
  }
}

module.exports = {
  ApiError,
  ValidationError,
  DuplicateError,
  NotFoundError,
  UnauthorizedError
};