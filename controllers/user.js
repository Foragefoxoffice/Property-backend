const User = require("../models/User");
const Staff = require("../models/Staff");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

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
exports.createUser = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (email) {
    const [existingUser, existingStaff] = await Promise.all([
      User.findOne({ email }),
      Staff.findOne({ staffsEmail: email })
    ]);

    if (existingUser || existingStaff) {
      return next(new ErrorResponse("This email address is already registered. Please use a different one or try logging in.", 400));
    }
  }

  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});

// Update user
exports.updateUser = asyncHandler(async (req, res, next) => {
  console.log("📝 Updating User:", req.params.id);

  const { email } = req.body;

  // Find user first
  let existingUserMatch = await User.findById(req.params.id);
  if (!existingUserMatch)
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );

  // If email is being changed, check if new email exists in either collection
  if (email && email !== existingUserMatch.email) {
    const [existingUser, existingStaff] = await Promise.all([
      User.findOne({ email }),
      Staff.findOne({ staffsEmail: email })
    ]);

    if (existingUser || existingStaff) {
      return next(new ErrorResponse("This email address is already registered. Please use a different one or try logging in.", 400));
    }
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (updatedUser) {
    console.log("✅ User updated successfully. New Profile Image:", updatedUser.profileImage);

    // IF STATUS CHANGED TO INACTIVE, EMIT SOCKET EVENT FOR INSTANT LOGOUT
    if (req.body.status === 'Inactive') {
      const io = req.app.get('io');
      if (io) {
        io.emit('accountDeactivated', { userId: req.params.id });
        console.log(`🔌 Deactivation event emitted for user: ${req.params.id}`.red.bold);
      }
    }
  } else {
    console.log("❌ User update failed - user not found");
  }
  if (!updatedUser)
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  res.status(200).json({ success: true, data: updatedUser });
});

// Delete user
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  await user.deleteOne();

  // EMIT SOCKET EVENT FOR INSTANT LOGOUT
  const io = req.app.get('io');
  if (io) {
    io.emit('accountDeactivated', { userId: req.params.id });
    console.log(`🔌 Deletion event emitted for user: ${req.params.id}`.red.bold);
  }

  res
    .status(200)
    .json({ success: true, message: "User deleted successfully ✅" });
});
