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
    !staffsEmail ||
    !staffsGender
  ) {
    throw new ErrorResponse("All fields are required", 400);
  }

  // Check in Staff collection
  const existingEmail = await Staff.findOne({ staffsEmail });
  if (existingEmail) throw new ErrorResponse("Email already exists", 400);

  // Generate default password for Staff
  const rawPassword = "Admin@123";

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
    staffsDepartment_en,
    staffsDepartment_vi,
    staffsDesignation_en,
    staffsDesignation_vi,
    staffsDob,
    staffsJoiningDate,
    status
  } = req.body;

  // Prevent duplicate email
  if (staffsEmail) {
    const existing = await Staff.findOne({
      staffsEmail: staffsEmail,
      _id: { $ne: req.params.id },
    });
    if (existing) throw new ErrorResponse("Email already exists", 400);
  }

  // Find staff first to ensure it exists
  let staff = await Staff.findById(req.params.id);
  if (!staff) throw new ErrorResponse("Staff not found", 404);

  // Prevent update of Super Admin Staff
  if (staff.staffsRole?.en === "Super Admin") {
    throw new ErrorResponse("Cannot update Super Admin staff", 403);
  }

  // Construct update object with nested fields
  const updateFields = {};

  if (staffsImage !== undefined) updateFields.staffsImage = staffsImage;

  if (staffsName_en !== undefined || staffsName_vi !== undefined) {
    updateFields.staffsName = {
      en: staffsName_en !== undefined ? staffsName_en : staff.staffsName.en,
      vi: staffsName_vi !== undefined ? staffsName_vi : staff.staffsName.vi
    };
  }

  if (staffsId !== undefined) updateFields.staffsId = staffsId;
  if (staffsEmail !== undefined) updateFields.staffsEmail = staffsEmail;

  if (staffsRole_en !== undefined || staffsRole_vi !== undefined) {
    updateFields.staffsRole = {
      en: staffsRole_en !== undefined ? staffsRole_en : staff.staffsRole.en,
      vi: staffsRole_vi !== undefined ? staffsRole_vi : staff.staffsRole.vi
    };
  }

  if (staffsNumbers !== undefined) updateFields.staffsNumbers = staffsNumbers;
  if (staffsGender !== undefined) updateFields.staffsGender = staffsGender;

  if (staffsDepartment_en !== undefined || staffsDepartment_vi !== undefined) {
    updateFields.staffsDepartment = {
      en: staffsDepartment_en !== undefined ? staffsDepartment_en : (staff.staffsDepartment?.en || ""),
      vi: staffsDepartment_vi !== undefined ? staffsDepartment_vi : (staff.staffsDepartment?.vi || "")
    };
  }

  if (staffsDesignation_en !== undefined || staffsDesignation_vi !== undefined) {
    updateFields.staffsDesignation = {
      en: staffsDesignation_en !== undefined ? staffsDesignation_en : (staff.staffsDesignation?.en || ""),
      vi: staffsDesignation_vi !== undefined ? staffsDesignation_vi : (staff.staffsDesignation?.vi || "")
    };
  }

  if (staffsNotes_en !== undefined || staffsNotes_vi !== undefined) {
    updateFields.staffsNotes = {
      en: staffsNotes_en !== undefined ? staffsNotes_en : (staff.staffsNotes?.en || ""),
      vi: staffsNotes_vi !== undefined ? staffsNotes_vi : (staff.staffsNotes?.vi || "")
    };
  }

  if (staffsDob !== undefined) updateFields.staffsDob = staffsDob;
  if (staffsJoiningDate !== undefined) updateFields.staffsJoiningDate = staffsJoiningDate;
  if (status !== undefined) updateFields.status = status;

  staff = await Staff.findByIdAndUpdate(req.params.id, updateFields, {
    new: true,
    runValidators: true,
  });

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

  // Prevent deletion of Super Admin
  if (staff.staffsRole?.en === "Super Admin") {
    throw new ErrorResponse("Cannot delete Super Admin staff", 403);
  }

  await staff.deleteOne();
  res.status(200).json({
    success: true,
    message: "Staff deleted successfully",
  });
});
