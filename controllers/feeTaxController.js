const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const FeeTax = require("../models/FeeTax");
const CreateProperty = require("../models/CreateProperty");

// ✅ GET ALL
exports.getFeeTax = asyncHandler(async (req, res) => {
  const records = await FeeTax.aggregate([
    { $addFields: { numericCode: { $toInt: "$code.en" } } },
    { $sort: { numericCode: 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: records,
  });
});


// ✅ CREATE
exports.createFeeTax = asyncHandler(async (req, res) => {
  const { name_en, name_vi, status } = req.body;

  if (!name_en || !name_vi) {
    throw new ErrorResponse("Name EN & VI are required", 400);
  }

  // Fetch all existing codes and convert to numbers
  const existing = await FeeTax.find({}, { "code.en": 1 }).lean();

  const numericCodes = existing
    .map((r) => parseInt(r.code?.en))
    .filter((n) => !isNaN(n));

  let nextNumber = 1;
  if (numericCodes.length > 0) {
    nextNumber = Math.max(...numericCodes) + 1;
  }

  const autoCode = String(nextNumber).padStart(3, "0");

  const newRecord = await FeeTax.create({
    code: { en: autoCode, vi: autoCode },
    name: { en: name_en, vi: name_vi },
    status: status || "Active",
  });

  res.status(201).json({
    success: true,
    message: "Fee/Tax created successfully",
    data: newRecord,
  });
});


// ✅ UPDATE
exports.updateFeeTax = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, status } = req.body;

  const record = await FeeTax.findById(req.params.id);
  if (!record) throw new ErrorResponse("Fee/Tax not found", 404);

  record.code.en = code_en ?? record.code.en;
  record.code.vi = code_vi ?? record.code.vi;
  record.name.en = name_en ?? record.name.en;
  record.name.vi = name_vi ?? record.name.vi;
  record.status = status ?? record.status;

  await record.save();

  res.status(200).json({
    success: true,
    message: "Fee/Tax updated successfully",
    data: record,
  });
});

// ✅ DELETE
exports.deleteFeeTax = asyncHandler(async (req, res) => {
  const record = await FeeTax.findById(req.params.id);
  if (!record) throw new ErrorResponse("Fee/Tax not found", 404);

  const isUsed = await CreateProperty.exists({
    $or: [
      { "financialDetails.financialDetailsFeeTax.en": record.name.en },
      { "financialDetails.financialDetailsFeeTax.vi": record.name.vi }
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
    message: "Fee/Tax deleted successfully",
  });
});
