const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const LegalDocument = require("../models/LegalDocument");

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

  // Read existing codes
  const existing = await LegalDocument.find({}, { "code.en": 1 }).lean();

  const numericCodes = existing
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

  await record.deleteOne();

  res.status(200).json({
    success: true,
    message: "Legal document deleted successfully",
  });
});
