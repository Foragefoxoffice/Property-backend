const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const ZoneSubArea = require("../models/ZoneSubArea");

// @desc    Get all Zone/Sub-area
// @route   GET /api/v1/zonesubarea
exports.getZoneSubAreas = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.property) {
    query.property = req.query.property;
  }

  const zones = await ZoneSubArea.find(query)
    .populate("property")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: zones.length,
    data: zones
  });
});


// @desc    Create Zone/Sub-area
// @route   POST /api/v1/zonesubarea
exports.createZoneSubArea = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, property } = req.body;

  if (!property) throw new ErrorResponse("Property is required", 400);

  const zone = await ZoneSubArea.create({
    property,
    code: { en: code_en, vi: code_vi },
    name: { en: name_en, vi: name_vi },
  });

  res.status(201).json({ success: true, data: zone });
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
