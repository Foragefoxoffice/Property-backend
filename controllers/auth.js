const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

/* =========================================================
   REGISTER USER
========================================================= */
// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Private/Admin (if you have admin restriction)
exports.register = asyncHandler(async (req, res, next) => {
  const { employeeId, name, email, phone } = req.body;

  // Check if user already exists
  if (await User.findOne({ email })) {
    return next(new ErrorResponse("User already exists", 400));
  }

  // Generate random password
  const firstName = name.split(" ")[0].toLowerCase();
  const rawPassword = `${firstName}@${Math.floor(1000 + Math.random() * 9000)}`;

  // Handle profile upload
  let profileImage = null;
  if (req.files && req.files.profileImage) {
    const file = req.files.profileImage;
    const uploadDir = path.join(__dirname, "../uploads/profile/");
    fs.mkdirSync(uploadDir, { recursive: true });
    const fileName = Date.now() + "-" + file.name;
    const uploadPath = path.join(uploadDir, fileName);
    await file.mv(uploadPath);
    profileImage = `/uploads/profile/${fileName}`;
  }

  // Create user
  const user = await User.create({
    employeeId,
    name,
    email,
    phone,
    password: rawPassword,
    isVerified: true,
    profileImage,
  });

  // Send credentials email
  const message = `
    <h2>Welcome ${name}</h2>
    <p>Your account has been created successfully.</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Password:</strong> ${rawPassword}</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your Account Credentials",
      message,
    });
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        employeeId,
        name,
        email,
        profileImage,
      },
    });
  } catch (err) {
    await User.findByIdAndDelete(user._id);
    return next(
      new ErrorResponse("User created but email could not be sent", 500)
    );
  }
});

/* =========================================================
   LOGIN (Email or Employee ID)
========================================================= */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, employeeId, password } = req.body;

  if ((!email && !employeeId) || !password) {
    return next(
      new ErrorResponse("Please provide email or employee ID and password", 400)
    );
  }

  const user = await User.findOne({
    $or: [{ email }, { employeeId }],
  }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
    },
  });
});

/* =========================================================
   ME (Current User)
========================================================= */
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
});

/* =========================================================
   UPDATE DETAILS
========================================================= */
exports.updateDetails = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;
  const fieldsToUpdate = { name, email, phone };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

/* =========================================================
   UPDATE PASSWORD (Logged-in user)
========================================================= */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password incorrect", 401));
  }
  user.password = req.body.newPassword;
  await user.save();
  res
    .status(200)
    .json({ success: true, message: "Password updated successfully" });
});

/* =========================================================
   FORGOT PASSWORD (Send OTP)
========================================================= */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new ErrorResponse("Provide email", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorResponse("No user found", 404));

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordToken = otp;
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  await user.save();

  const message = `
    <h2>Password Reset OTP</h2>
    <p>Your OTP: <strong>${otp}</strong></p>
    <p>Valid for 30 minutes.</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset OTP",
      message,
    });
    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

/* =========================================================
   RESET PASSWORD (With OTP)
========================================================= */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return next(new ErrorResponse("Email, OTP & new password required", 400));
  }

  const user = await User.findOne({
    email,
    resetPasswordToken: otp,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+password");

  if (!user) return next(new ErrorResponse("Invalid or expired OTP", 400));

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({ success: true, message: "Password reset successful" });
});

/* =========================================================
   LOGOUT
========================================================= */
exports.logout = asyncHandler(async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, data: {} });
});
