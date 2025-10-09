const express = require("express");
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  logout,
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();

/**
 * ============================
 *  PUBLIC ROUTES
 * ============================
 */

// Register a new user (admin assigns role)
router.post("/register", register);

// Login user
router.post("/login", login);

// Forgot password - send OTP to email
router.post("/forgot-password", forgotPassword);

// Reset password using OTP
router.post("/reset-password", resetPassword);

/**
 * ============================
 *  PROTECTED ROUTES
 * ============================
 */

// Get current logged-in user info
router.get("/me", protect, getMe);

// Update profile details
router.put("/update-details", protect, updateDetails);

// Update password (while logged in)
router.put("/update-password", protect, updatePassword);

// Logout user
router.get("/logout", protect, logout);

module.exports = router;
