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

// ✅ Create new staff
exports.createStaff = asyncHandler(async (req, res) => {
  const {
    staffsImage,
    staffsName_en,
    staffsName_vi,
    staffsId,
    staffsRole_en,
    staffsRole_vi,
    staffsNumber,
    staffsNotes_en,
    staffsNotes_vi,
  } = req.body;

  if (
    !staffsName_en ||
    !staffsName_vi ||
    !staffsRole_en ||
    !staffsRole_vi ||
    !staffsNumber ||
    !staffsId
  ) {
    throw new ErrorResponse(
      "All English and Vietnamese fields plus ID and Number are required",
      400
    );
  }

  const staff = await Staff.create({
    staffsImage: staffsImage || null,
    staffsName: { en: staffsName_en, vi: staffsName_vi },
    staffsId,
    staffsRole: { en: staffsRole_en, vi: staffsRole_vi },
    staffsNumber,
    staffsNotes: { en: staffsNotes_en, vi: staffsNotes_vi },
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
    staffsNumber,
    staffsNotes_en,
    staffsNotes_vi,
  } = req.body;

  const staff = await Staff.findById(req.params.id);
  if (!staff) throw new ErrorResponse("Staff not found", 404);

  // 🧠 Force multilingual fields to always be objects
  if (typeof staff.staffsName !== "object")
    staff.staffsName = { en: "", vi: "" };
  if (typeof staff.staffsRole !== "object")
    staff.staffsRole = { en: "", vi: "" };
  if (typeof staff.staffsNotes !== "object")
    staff.staffsNotes = { en: "", vi: "" };

  // ✅ Apply updates safely
  staff.staffsName.en = staffsName_en ?? staff.staffsName.en;
  staff.staffsName.vi = staffsName_vi ?? staff.staffsName.vi;
  staff.staffsRole.en = staffsRole_en ?? staff.staffsRole.en;
  staff.staffsRole.vi = staffsRole_vi ?? staff.staffsRole.vi;
  staff.staffsNotes.en = staffsNotes_en ?? staff.staffsNotes.en;
  staff.staffsNotes.vi = staffsNotes_vi ?? staff.staffsNotes.vi;
  staff.staffsId = staffsId ?? staff.staffsId;
  staff.staffsNumber = staffsNumber ?? staff.staffsNumber;
  staff.staffsImage = staffsImage ?? staff.staffsImage;

  await staff.save();

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
