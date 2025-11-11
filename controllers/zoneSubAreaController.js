const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const ZoneSubArea = require("../models/ZoneSubArea");
const Property = require("../models/Property");
const Block = require("../models/Block");

// ✅ GET all zones/sub-areas
exports.getZoneSubAreas = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.property) query.property = req.query.property;

  const zones = await ZoneSubArea.find(query)
    .populate("property")
    .populate("blocks")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: zones.length,
    data: zones,
  });
});

// ✅ CREATE Zone/Sub-area
exports.createZoneSubArea = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, property } = req.body;

  if (!property) throw new ErrorResponse("Property is required", 400);

  const zone = await ZoneSubArea.create({
    property,
    code: { en: code_en, vi: code_vi },
    name: { en: name_en, vi: name_vi },
  });

  // ✅ Add Zone to Property
  await Property.findByIdAndUpdate(property, {
    $push: { zones: zone._id },
  });

  res.status(201).json({ success: true, data: zone });
});

// ✅ UPDATE Zone/Sub-area
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

// ✅ DELETE Zone/Sub-area
exports.deleteZoneSubArea = asyncHandler(async (req, res) => {
  const zone = await ZoneSubArea.findById(req.params.id);
  if (!zone) throw new ErrorResponse("Zone/Sub-area not found", 404);

  // ✅ Remove this zone ID from its Property
  await Property.findByIdAndUpdate(zone.property, {
    $pull: { zones: zone._id },
  });

  // ✅ Delete Blocks inside this zone
  await Block.deleteMany({ zone: zone._id });

  await zone.deleteOne();

  res.status(200).json({
    success: true,
    message: "Zone/Sub-area deleted successfully",
  });
});
