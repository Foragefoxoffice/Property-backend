const Staff = require("../models/Staff");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

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
    status,
    password
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

  // Generate random password for Staff if not provided
  const rawPassword = password || crypto.randomBytes(8).toString("hex");

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

  // Send Email with password
  try {
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #41398B;">Welcome to the Team, ${staffsName_en}!</h2>
        <p>Your staff account has been created successfully. Below are your login credentials:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${staffsEmail}</p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <span style="color: #41398B; font-size: 1.2em; font-weight: bold;">${rawPassword}</span></p>
        </div>
        <p>Please log in and change your password as soon as possible for security reasons.</p>
        <p>Best regards,<br>The Management Team</p>
      </div>
    `;

    await sendEmail({
      email: staffsEmail,
      subject: "Your Staff Account Credentials",
      message: message,
    });
  } catch (err) {
    console.error("Error sending staff creation email:", err);
    throw new ErrorResponse(`Staff account created, but failed to send email: ${err.message}`, 500);
  }

  res.status(201).json({
    success: true,
    message: "Staff created successfully and email sent",
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

  console.log("📝 Updating Staff:", req.params.id);
  console.log("📦 Internal updateFields:", JSON.stringify(updateFields, null, 2));

  staff = await Staff.findByIdAndUpdate(req.params.id, updateFields, {
    new: true,
    runValidators: true,
  });

  if (staff) {
    console.log("✅ Staff updated successfully. New Staff Image:", staff.staffsImage);
  } else {
    console.log("❌ Staff update failed - staff not found");
  }

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
