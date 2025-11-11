const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const FloorRange = require("../models/FloorRange");

// ✅ Get All
exports.getFloorRanges = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const floorRanges = await FloorRange.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await FloorRange.countDocuments();

  res.status(200).json({
    success: true,
    count: floorRanges.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    data: floorRanges,
  });
});

// ✅ Create
exports.createFloorRange = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, status } = req.body;

  if (!code_en || !code_vi || !name_en || !name_vi) {
    throw new ErrorResponse("All English and Vietnamese fields are required", 400);
  }

  const exists = await FloorRange.findOne({
    $or: [{ "code.en": code_en }, { "code.vi": code_vi }],
  });

  if (exists) throw new ErrorResponse("Floor Range code already exists", 400);

  const newEntry = await FloorRange.create({
    code: { en: code_en, vi: code_vi },
    name: { en: name_en, vi: name_vi },
    status: status || "Active",
  });

  res.status(201).json({
    success: true,
    message: "Floor Range created successfully",
    data: newEntry,
  });
});

// ✅ Update
exports.updateFloorRange = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, status } = req.body;

  const entry = await FloorRange.findById(req.params.id);
  if (!entry) throw new ErrorResponse("Floor Range not found", 404);

  entry.code.en = code_en ?? entry.code.en;
  entry.code.vi = code_vi ?? entry.code.vi;
  entry.name.en = name_en ?? entry.name.en;
  entry.name.vi = name_vi ?? entry.name.vi;
  entry.status = status ?? entry.status;

  await entry.save();

  res.status(200).json({
    success: true,
    message: "Floor Range updated successfully",
    data: entry,
  });
});

// ✅ Delete
exports.deleteFloorRange = asyncHandler(async (req, res) => {
  const entry = await FloorRange.findById(req.params.id);
  if (!entry) throw new ErrorResponse("Floor Range not found", 404);

  await entry.deleteOne();

  res.status(200).json({
    success: true,
    message: "Floor Range deleted successfully",
  });
});
