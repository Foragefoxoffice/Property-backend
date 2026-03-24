const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const Staff = require("../models/Staff");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const { getCredentialsTemplate, getOTPTemplate } = require("../utils/emailTemplates");
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

  // Check if email already exists in either collection
  const [existingUser, existingStaff] = await Promise.all([
    User.findOne({ email }),
    Staff.findOne({ staffsEmail: email })
  ]);

  if (existingUser || existingStaff) {
    return next(new ErrorResponse("This email address is already registered. Please use a different one or try logging in.", 400));
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
  const message = getCredentialsTemplate(name, email, rawPassword, "Your Account credentials");

  try {
    await sendEmail({
      email: user.email,
      subject: `Welcome to ${process.env.FROM_NAME || 'our Platform'}! Your Account is Ready`,
      message,
    });
    res.status(200).json({
      success: true,
      message: "Account created successfully. User credentials have been sent via email.",
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
    return next(new ErrorResponse("The passwords you entered do not match. Please try again.", 400));
  }

  // Check if email already exists in either collection
  const [existingUser, existingStaff] = await Promise.all([
    User.findOne({ email }),
    Staff.findOne({ staffsEmail: email })
  ]);

  if (existingUser || existingStaff) {
    return next(new ErrorResponse("This email address is already registered. Please use a different one or try logging in.", 400));
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
    return next(new ErrorResponse("We couldn't find an account with those details. Please check your credentials and try again.", 401));
  }

  // 3️⃣ Check Verification
  if (!user.isVerified) {
    console.log("⚠️ Account not verified.");
    return next(
      new ErrorResponse("Your account is not yet verified. Please contact our support team or administrator for assistance.", 401)
    );
  }

  // 3.5 Check Status (for Staff)
  if (isStaff && user.status === 'Inactive') {
    console.log("⚠️ Account is Inactive.");
    return next(
      new ErrorResponse("Your account is currently inactive. Please contact your administrator to reactivate it.", 401)
    );
  }

  // 4️⃣ Match Password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    console.log("❌ Password mismatch");
    return next(new ErrorResponse("The password you entered is incorrect. Please try again.", 401));
  }

  // 5️⃣ Generate Token
  const token = user.getSignedJwtToken();

  let userData = {};
  if (isStaff) {
    userData = {
      id: user._id,
      employeeId: user.staffsId,
      name: user.staffsName?.en || "Staff Member",
      email: user.staffsEmail,
      role: user.staffsRole?.en || 'staff',
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
  const user = req.user;

  // Convert Mongoose document to plain object if possible
  const userObj = user.toObject ? user.toObject() : { ...user };

  // Explicitly ensure normalized fields (set by protect middleware) are in the response
  // Mongoose .toJSON()/.toObject() often strips ad-hoc properties not in schema
  const responseData = {
    ...userObj,
    id: user._id,
    role: user.role || userObj.role,   // Middleware sets user.role for Staff
    email: user.email || userObj.email, // Middleware sets user.email for Staff
    name: user.name || userObj.name,   // Middleware sets user.name for Staff
  };

  res.status(200).json({ success: true, data: responseData });
});

/* =========================================================
   UPDATE DETAILS
========================================================= */
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const { name, email, phone, profileImage, staffsImage } = req.body;

  // Find if user is in User or Staff collection
  let user = await User.findById(req.user.id);
  let isStaff = false;

  if (!user) {
    user = await Staff.findById(req.user.id);
    isStaff = true;
  }

  if (!user) {
    console.log(`❌ UpdateDetails: User with ID ${req.user.id} not found.`);
    return next(new ErrorResponse("User not found", 404));
  }

  if (isStaff) {
    const updateFields = {};
    if (name) updateFields.staffsName = { en: name, vi: user.staffsName?.vi || '' }; // Simple mapping
    if (email) updateFields.staffsEmail = email;
    if (phone) updateFields.staffsNumbers = [phone];
    if (profileImage || staffsImage) updateFields.staffsImage = profileImage || staffsImage;

    console.log(`📤 Updating Staff Profile. ID: ${req.user.id}, Payload:`, updateFields);
    const updatedStaff = await Staff.findByIdAndUpdate(req.user.id, updateFields, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({ success: true, data: updatedStaff });
  } else {
    const fieldsToUpdate = { name, email, phone, profileImage };
    console.log(`📤 Updating User Profile. ID: ${req.user.id}, Payload:`, fieldsToUpdate);
    const updatedUser = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({ success: true, data: updatedUser });
  }
});

/* =========================================================
   UPDATE PASSWORD (Logged-in user)
========================================================= */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.user.id).select("+password");

  if (!user) {
    user = await Staff.findById(req.user.id).select("+password");
  }

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  if (req.body.currentPassword === req.body.newPassword) {
    return next(new ErrorResponse("New password cannot be the same as the current password", 400));
  }

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("The current password you entered is incorrect", 400));
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
  let { email } = req.body;
  if (!email) return next(new ErrorResponse("Provide email", 400));
  email = email.toLowerCase().trim();

  let user = await User.findOne({ email });
  if (!user) {
    user = await Staff.findOne({ staffsEmail: email });
  }

  if (!user) {
    console.log(`❌ ForgotPassword: No user or staff found with email: ${email}`);
    return next(new ErrorResponse("We couldn't find an account associated with this email address.", 404));
  }

  console.log(`✅ ForgotPassword: Found user/staff for email ${email}`);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const resetData = {
    resetPasswordToken: otp,
    resetPasswordExpire: Date.now() + 30 * 60 * 1000,
  };

  // Use findOneAndUpdate to ensure fields are saved even if schema was recently updated
  if (user.staffsEmail) {
    await Staff.findByIdAndUpdate(user._id, resetData);
  } else {
    await User.findByIdAndUpdate(user._id, resetData);
  }

  const message = getOTPTemplate(otp, "Password Reset OTP");

  try {
    await sendEmail({
      email: user.email || user.staffsEmail,
      subject: "Reset Your Password - Property Management",
      message,
    });
    res.status(200).json({ success: true, message: "A verification code has been sent to your email address. It will be valid for 30 minutes." });
  } catch (err) {
    console.log(`❌ ForgotPassword Error sending email: ${err.message}`);
    const clearData = {
      resetPasswordToken: undefined,
      resetPasswordExpire: undefined,
    };
    if (user.staffsEmail) {
      await Staff.findByIdAndUpdate(user._id, clearData);
    } else {
      await User.findByIdAndUpdate(user._id, clearData);
    }
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

/* =========================================================
   RESET PASSWORD (With OTP)
========================================================= */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  let { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return next(new ErrorResponse("Email, OTP & new password required", 400));
  }
  email = email.toLowerCase().trim();
  otp = otp.trim();

  console.log(`🔍 ResetPassword Attempt: email=${email}, otp=${otp}`);

  let user = await User.findOne({ email }).select("+password");
  let foundIn = 'User';

  if (!user) {
    user = await Staff.findOne({ staffsEmail: email }).select("+password");
    foundIn = 'Staff';
  }

  if (!user) {
    console.log(`❌ ResetPassword: No account found for email ${email}`);
    return next(new ErrorResponse("The verification code you provided is invalid or has expired. Please request a new one.", 400));
  }

  console.log(`✅ ResetPassword: Found ${foundIn} record. Checking OTP...`);
  console.log(`   Stored OTP: ${user.resetPasswordToken}, Expiry: ${user.resetPasswordExpire}`);
  console.log(`   Current Time: ${new Date().toISOString()}`);

  if (user.resetPasswordToken !== otp || !user.resetPasswordExpire || user.resetPasswordExpire < Date.now()) {
    console.log(`❌ ResetPassword: OTP mismatch or expired.`);
    return next(new ErrorResponse("The verification code you provided is invalid or has expired. Please request a new one.", 400));
  }

  console.log(`✅ ResetPassword: OTP verified for ${foundIn}. Updating password.`);

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({ success: true, message: "Your password has been successfully reset. You can now log in with your new password." });
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
