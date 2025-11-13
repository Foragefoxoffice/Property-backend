const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const ZoneSubArea = require("../models/ZoneSubArea");
const Property = require("../models/Property");
const Block = require("../models/Block");

// ✅ GET all zones/sub-areas
exports.getZoneSubAreas = asyncHandler(async (req, res) => {
  const zones = await ZoneSubArea.aggregate([
    {
      $addFields: {
        numericCode: { $toInt: "$code.en" }
      }
    },
    { $sort: { numericCode: 1 } },
    {
      $lookup: {
        from: "properties",
        localField: "property",
        foreignField: "_id",
        as: "property"
      }
    },
    { $unwind: "$property" }
  ]);

  res.status(200).json({
    success: true,
    data: zones
  });
});


// ✅ CREATE Zone/Sub-area
exports.createZoneSubArea = asyncHandler(async (req, res) => {
  const { name_en, name_vi, property } = req.body;

  if (!property) {
    throw new ErrorResponse("Property is required", 400);
  }
  if (!name_en || !name_vi) {
    throw new ErrorResponse("English & Vietnamese names are required", 400);
  }

  // Get existing codes
  const existing = await ZoneSubArea.find({ property }, { "code.en": 1 }).lean();

  const numericCodes = existing
    .map((r) => parseInt(r.code?.en))
    .filter((n) => !isNaN(n));

  let next = 1;
  if (numericCodes.length > 0) {
    next = Math.max(...numericCodes) + 1;
  }

  const autoCode = String(next).padStart(3, "0");

  const zone = await ZoneSubArea.create({
    property,
    code: { en: autoCode, vi: autoCode },
    name: { en: name_en, vi: name_vi },
    status: "Active",
  });

  await Property.findByIdAndUpdate(property, { $push: { zones: zone._id } });

  res.status(201).json({
    success: true,
    message: "Zone/Sub-area created successfully",
    data: zone,
  });
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
