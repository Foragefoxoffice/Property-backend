const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");

// Get all users
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json({ success: true, count: users.length, data: users });
});

// Get single user
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  res.status(200).json({ success: true, data: user });
});

// Create user
exports.createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});

// Update user
exports.updateUser = asyncHandler(async (req, res, next) => {
  console.log("📝 Updating User:", req.params.id);
  console.log("📦 Payload:", JSON.stringify(req.body, null, 2));

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (user) {
    console.log("✅ User updated successfully. New Profile Image:", user.profileImage);
  } else {
    console.log("❌ User update failed - user not found");
  }
  if (!user)
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  res.status(200).json({ success: true, data: user });
});

// Delete user
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  await user.deleteOne();
  res
    .status(200)
    .json({ success: true, message: "User deleted successfully ✅" });
});
