const Staff = require("../models/Staff");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// ✅ Get all staffs
exports.getStaffs = asyncHandler(async (req, res) => {
  const staffs = await Staff.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    data: staffs,
  });
});

exports.createStaff = asyncHandler(async (req, res) => {
  const {
    staffsImage,
    staffsName_en,
    staffsName_vi,
    staffsId,
    staffsRole_en,
    staffsRole_vi,
    staffsNumbers,
    staffsGender,
    staffsNotes_en,
    staffsNotes_vi,
    staffsEmail,
    // New fields
    staffsDepartment_en,
    staffsDepartment_vi,
    staffsDesignation_en,
    staffsDesignation_vi,
    staffsDob,
    staffsJoiningDate,
    status
  } = req.body;

  if (
    !staffsName_en ||
    !staffsName_vi ||
    !staffsRole_en ||
    !staffsRole_vi ||
    !staffsId ||
    !staffsEmail ||
    !staffsGender
  ) {
    throw new ErrorResponse("All fields are required", 400);
  }

  // Check in Staff collection
  const existingEmail = await Staff.findOne({ staffsEmail });
  if (existingEmail) throw new ErrorResponse("Email already exists", 400);

  // Generate random password for Staff
  const firstName = staffsName_en.split(" ")[0].toLowerCase();
  const rawPassword = `${firstName}@1234`; // Simple default password for staff

  console.log(`Creating Staff ${staffsName_en} with password: ${rawPassword}`);

  const staff = await Staff.create({
    staffsImage: staffsImage || null,
    staffsName: { en: staffsName_en, vi: staffsName_vi },
    staffsId,
    staffsEmail,
    staffsRole: { en: staffsRole_en, vi: staffsRole_vi },
    staffsNumbers: staffsNumbers || [],
    staffsGender,
    staffsNotes: { en: staffsNotes_en, vi: staffsNotes_vi },
    // New mappings
    staffsDepartment: { en: staffsDepartment_en || "", vi: staffsDepartment_vi || "" },
    staffsDesignation: { en: staffsDesignation_en || "", vi: staffsDesignation_vi || "" },
    staffsDob,
    staffsJoiningDate,
    status: status || "Active",
    // Auth
    password: rawPassword,
    isVerified: true,
  });

  res.status(201).json({
    success: true,
    message: "Staff created successfully",
    data: staff,
  });
});



// ✅ Update staff
exports.updateStaff = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };

  // Prevent duplicate email
  if (updateData.staffsEmail) {
    const existing = await Staff.findOne({
      staffsEmail: updateData.staffsEmail,
      _id: { $ne: req.params.id },
    });
    if (existing) throw new ErrorResponse("Email already exists", 400);
  }

  const staff = await Staff.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!staff) throw new ErrorResponse("Staff not found", 404);

  res.status(200).json({
    success: true,
    message: "Staff updated successfully",
    data: staff,
  });
});


// ✅ Delete staff
exports.deleteStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.params.id);
  if (!staff) throw new ErrorResponse("Staff not found", 404);

  await staff.deleteOne();
  res.status(200).json({
    success: true,
    message: "Staff deleted successfully",
  });
});
