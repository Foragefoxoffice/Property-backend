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
   PUBLIC USER REGISTRATION
========================================================= */
// @desc    Register public user (not admin)
// @route   POST /api/v1/auth/user-register
// @access  Public
exports.userRegister = asyncHandler(async (req, res, next) => {
  const { name, email, password, confirmPassword, mobile } = req.body;

  // Validate required fields
  if (!name || !email || !password || !confirmPassword) {
    return next(new ErrorResponse("Please provide all required fields", 400));
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return next(new ErrorResponse("Passwords do not match", 400));
  }

  // Check if user already exists
  if (await User.findOne({ email })) {
    return next(new ErrorResponse("User already exists with this email", 400));
  }

  // Create user with role 'user' and auto-generated employeeId
  const employeeId = `USER-${Date.now()}`;

  const user = await User.create({
    employeeId,
    name,
    email,
    password,
    phone: mobile || "", // Store mobile number in phone field
    isVerified: true, // Auto-verify public users
    role: 'user',
  });

  // Generate token
  const token = user.getSignedJwtToken();

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      employeeId: user.employeeId,
    },
  });
});

/* =========================================================
   LOGIN (Email or Employee ID)
========================================================= */
const Staff = require("../models/Staff");

/* =========================================================
   LOGIN (Email/EmpID + Password) -> Checks User OR Staff
========================================================= */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, employeeId, password } = req.body;


  if ((!email && !employeeId) || !password) {
    return next(
      new ErrorResponse("Please provide email or employee ID and password", 400)
    );
  }

  // 1️⃣ Try Finding in USER Collection
  let user = await User.findOne({
    $or: [{ email }, { employeeId }],
  }).select("+password");

  let isStaff = false;


  // 2️⃣ If not found in User, try STAFF Collection
  if (!user) {

    user = await Staff.findOne({
      $or: [{ staffsEmail: email }, { staffsId: employeeId }],
    }).select("+password");

    if (user) {
      isStaff = true;
      console.log(`✅ Staff found: ${user.staffsName?.en || user._id}`);
    } else {
      console.log("❌ Staff not found");
    }
  }

  // If still not found
  if (!user) {
    console.log("🚫 No user or staff record found.");
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // 3️⃣ Check Verification
  if (!user.isVerified) {
    console.log("⚠️ Account not verified.");
    return next(
      new ErrorResponse("Your account is not verified. Please contact admin.", 401)
    );
  }

  // 3.5 Check Status (for Staff)
  if (isStaff && user.status === 'Inactive') {
    console.log("⚠️ Account is Inactive.");
    return next(
      new ErrorResponse("Your account is Inactive. Please contact admin.", 401)
    );
  }

  // 4️⃣ Match Password
  const isMatch = await user.matchPassword(password);
  console.log(`🔐 Password match: ${isMatch}`);

  if (!isMatch) {
    console.log("❌ Password mismatch");
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // 5️⃣ Generate Token
  const token = user.getSignedJwtToken();

  // 6️⃣ Prepare Response Data
  // If it's a staff member, we normalize the fields to match the 'User' structure expected by frontend
  let userData = {};
  if (isStaff) {
    userData = {
      id: user._id,
      employeeId: user.staffsId,
      name: user.staffsName?.en || "Staff Member", // Use English name or fallback
      email: user.staffsEmail,
      role: user.staffsRole?.en || 'staff',
      // Add other fields if needed
    };
  } else {
    userData = {
      id: user._id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  console.log("🚀 Login successful for:", userData.email);

  res.status(200).json({
    success: true,
    token,
    user: userData,
  });
});

/* =========================================================
   ME (Current User)
========================================================= */
exports.getMe = asyncHandler(async (req, res) => {
  // User is already fetched by the protect middleware
  res.status(200).json({ success: true, data: req.user });
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
