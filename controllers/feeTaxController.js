const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const FeeTax = require("../models/FeeTax");

// ✅ GET ALL
exports.getFeeTax = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const records = await FeeTax.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await FeeTax.countDocuments();

  res.status(200).json({
    success: true,
    count: records.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    data: records,
  });
});

// ✅ CREATE
exports.createFeeTax = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, status } = req.body;

  if (!code_en || !code_vi || !name_en || !name_vi) {
    throw new ErrorResponse("All English & Vietnamese fields are required", 400);
  }

  const exists = await FeeTax.findOne({
    $or: [{ "code.en": code_en }, { "code.vi": code_vi }],
  });
  if (exists) throw new ErrorResponse("Fee/Tax code already exists", 400);

  const newRecord = await FeeTax.create({
    code: { en: code_en, vi: code_vi },
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

  await record.deleteOne();

  res.status(200).json({
    success: true,
    message: "Fee/Tax deleted successfully",
  });
});
