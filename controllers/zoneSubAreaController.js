const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const ZoneSubArea = require("../models/ZoneSubArea");

// @desc    Get all Zone/Sub-area
// @route   GET /api/v1/zonesubarea
exports.getZoneSubAreas = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const zones = await ZoneSubArea.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await ZoneSubArea.countDocuments();

  res.status(200).json({
    success: true,
    count: zones.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    data: zones,
  });
});

// @desc    Create Zone/Sub-area
// @route   POST /api/v1/zonesubarea
exports.createZoneSubArea = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, status } = req.body;

  if (!code_en || !code_vi || !name_en || !name_vi) {
    throw new ErrorResponse(
      "All English and Vietnamese fields are required",
      400
    );
  }

  const existing = await ZoneSubArea.findOne({
    $or: [{ "code.en": code_en }, { "code.vi": code_vi }],
  });
  if (existing) {
    throw new ErrorResponse("Zone/Sub-area code already exists", 400);
  }

  const zone = await ZoneSubArea.create({
    code: { en: code_en, vi: code_vi },
    name: { en: name_en, vi: name_vi },
    status: status || "Active",
  });

  res.status(201).json({
    success: true,
    message: "Zone/Sub-area created successfully",
    data: zone,
  });
});

// @desc    Update Zone/Sub-area
// @route   PUT /api/v1/zonesubarea/:id
exports.updateZoneSubArea = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, status } = req.body;

  const zone = await ZoneSubArea.findById(req.params.id);
  if (!zone) throw new ErrorResponse("Zone/Sub-area not found", 404);

  zone.code.en = code_en ?? zone.code.en;
  zone.code.vi = code_vi ?? zone.code.vi;
  zone.name.en = name_en ?? zone.name.en;
  zone.name.vi = name_vi ?? zone.name.vi;
  zone.status = status ?? zone.status;

  await zone.save();

  res.status(200).json({
    success: true,
    message: "Zone/Sub-area updated successfully",
    data: zone,
  });
});

// @desc    Delete Zone/Sub-area
// @route   DELETE /api/v1/zonesubarea/:id
exports.deleteZoneSubArea = asyncHandler(async (req, res) => {
  const zone = await ZoneSubArea.findById(req.params.id);
  if (!zone) throw new ErrorResponse("Zone/Sub-area not found", 404);

  await zone.deleteOne();

  res.status(200).json({
    success: true,
    message: "Zone/Sub-area deleted successfully",
  });
});
