const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const LegalDocument = require("../models/LegalDocument");
const CreateProperty = require("../models/CreateProperty");

// ✅ GET ALL
exports.getLegalDocuments = asyncHandler(async (req, res) => {
  const records = await LegalDocument.aggregate([
    { $addFields: { numericCode: { $toInt: "$code.en" } } },
    { $sort: { numericCode: 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: records,
  });
});

// ✅ CREATE
exports.createLegalDocument = asyncHandler(async (req, res) => {
  const { name_en, name_vi, status } = req.body;

  if (!name_en || !name_vi) {
    throw new ErrorResponse("Name EN & VI are required", 400);
  }

  // ❌ Prevent duplicate name
  const existing = await LegalDocument.findOne({
    $or: [
      { "name.en": { $regex: new RegExp(`^${name_en}$`, "i") } },
      { "name.vi": { $regex: new RegExp(`^${name_vi}$`, "i") } }
    ]
  });

  if (existing) {
    throw new ErrorResponse("Legal Document with this name already exists", 400);
  }

  // Read existing codes
  const existingCodes = await LegalDocument.find({}, { "code.en": 1 }).lean();

  const numericCodes = existingCodes
    .map((r) => parseInt(r.code?.en))
    .filter((n) => !isNaN(n));

  let nextNumber = 1;
  if (numericCodes.length > 0) {
    nextNumber = Math.max(...numericCodes) + 1;
  }

  const autoCode = String(nextNumber).padStart(3, "0");

  const newRecord = await LegalDocument.create({
    code: { en: autoCode, vi: autoCode },
    name: { en: name_en, vi: name_vi },
    status: status || "Active",
  });

  res.status(201).json({
    success: true,
    message: "Legal document created successfully",
    data: newRecord,
  });
});

// ✅ UPDATE
exports.updateLegalDocument = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, status } = req.body;

  const record = await LegalDocument.findById(req.params.id);
  if (!record) throw new ErrorResponse("Legal document not found", 404);

  // ❌ Prevent duplicate name on update
  if (name_en || name_vi) {
    const duplicate = await LegalDocument.findOne({
      _id: { $ne: record._id },
      $or: [
        { "name.en": { $regex: new RegExp(`^${name_en || record.name.en}$`, "i") } },
        { "name.vi": { $regex: new RegExp(`^${name_vi || record.name.vi}$`, "i") } }
      ]
    });

    if (duplicate) {
      throw new ErrorResponse("Legal Document with this name already exists", 400);
    }
  }

  record.code.en = code_en ?? record.code.en;
  record.code.vi = code_vi ?? record.code.vi;
  record.name.en = name_en ?? record.name.en;
  record.name.vi = name_vi ?? record.name.vi;
  record.status = status ?? record.status;

  await record.save();

  res.status(200).json({
    success: true,
    message: "Legal document updated successfully",
    data: record,
  });
});


// ✅ DELETE
exports.deleteLegalDocument = asyncHandler(async (req, res) => {
  const record = await LegalDocument.findById(req.params.id);
  if (!record) throw new ErrorResponse("Legal document not found", 404);

  const isUsed = await CreateProperty.exists({
    $or: [
      { "financialDetails.financialDetailsLegalDoc.en": record.name.en },
      { "financialDetails.financialDetailsLegalDoc.vi": record.name.vi }
    ]
  });

  if (isUsed) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete this master data because it is present in a created property. Delete the property first."
    });
  }

  await record.deleteOne();

  res.status(200).json({
    success: true,
    message: "Legal document deleted successfully",
  });
});
