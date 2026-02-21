const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  if (!err.statusCode || err.statusCode === 500) {
    console.error(err.stack?.red || err.message?.red);
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]; // which field is duplicated
    const message = `Duplicate value for ${field}. Please use another one.`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  // Handle specific technical errors from Mongoose
  if (err.message && (
    err.message.includes("Tried to set nested object field") ||
    err.message.includes("to primitive value") ||
    err.message.includes("Cast to object failed")
  )) {
    const message = "Invalid data format provided for some fields. Please check your input.";
    error = new ErrorResponse(message, 400);
  }

  // Generic fallback message for unhandled 500 errors in production (if NODE_ENV is set)
  if (!error.statusCode || error.statusCode === 500) {
    if (process.env.NODE_ENV === "production") {
      error.message = "An unexpected server error occurred. Please try again later.";
    }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;
