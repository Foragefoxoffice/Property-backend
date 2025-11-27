const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Block = require("../models/Block");
const Property = require("../models/Property");
const ZoneSubArea = require("../models/ZoneSubArea");

// ✅ GET all blocks
exports.getBlocks = asyncHandler(async (req, res) => {
  const blocks = await Block.aggregate([
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
    { $unwind: "$property" },
    {
      $lookup: {
        from: "zonesubareas",
        localField: "zone",
        foreignField: "_id",
        as: "zone"
      }
    },
    { $unwind: "$zone" }
  ]);

  res.status(200).json({ success: true, data: blocks });
});


// ✅ CREATE Block
exports.createBlock = asyncHandler(async (req, res) => {
  const { name_en, name_vi, property, zone } = req.body;

  if (!property) throw new ErrorResponse("Property is required", 400);
  if (!zone) throw new ErrorResponse("Zone is required", 400);
  if (!name_en || !name_vi)
    throw new ErrorResponse("Block name EN & VI required", 400);

  // Fetch all blocks
  const allBlocks = await Block.find().lean();

  // Extract numeric codes
  const numericCodes = allBlocks
    .map(b => parseInt(b.code?.en))
    .filter(n => !isNaN(n));

  let nextNumber = 1;
  if (numericCodes.length > 0) {
    nextNumber = Math.max(...numericCodes) + 1;
  }

  const autoCode = String(nextNumber).padStart(3, "0");

  const block = await Block.create({
    property,
    zone,
    code: { en: autoCode, vi: autoCode },
    name: { en: name_en, vi: name_vi },
  });

  await Property.findByIdAndUpdate(property, { $push: { blocks: block._id } });
  await ZoneSubArea.findByIdAndUpdate(zone, { $push: { blocks: block._id } });

  res.status(201).json({ success: true, data: block });
});


// ✅ UPDATE Block
exports.updateBlock = asyncHandler(async (req, res) => {
  const block = await Block.findById(req.params.id);
  if (!block) throw new ErrorResponse("Block not found", 404);

  const { code_en, code_vi, name_en, name_vi, property, zone, status } = req.body;

  const oldProperty = block.property.toString();
  const oldZone = block.zone.toString();

  // ✅ Update basic fields
  block.code.en = code_en ?? block.code.en;
  block.code.vi = code_vi ?? block.code.vi;
  block.name.en = name_en ?? block.name.en;
  block.name.vi = name_vi ?? block.name.vi;
  block.status = status ?? block.status;

  // ✅ Update property & zone
  if (property) block.property = property;
  if (zone) block.zone = zone;

  await block.save();

  // ✅ If property changed
  if (property && property !== oldProperty) {
    await Property.findByIdAndUpdate(oldProperty, { $pull: { blocks: block._id } });
    await Property.findByIdAndUpdate(property, { $push: { blocks: block._id } });
  }

  // ✅ If zone changed
  if (zone && zone !== oldZone) {
    await ZoneSubArea.findByIdAndUpdate(oldZone, { $pull: { blocks: block._id } });
    await ZoneSubArea.findByIdAndUpdate(zone, { $push: { blocks: block._id } });
  }

  res.status(200).json({
    success: true,
    message: "Block updated",
    data: block,
  });
});

// ✅ DELETE Block
exports.deleteBlock = asyncHandler(async (req, res) => {
  const block = await Block.findById(req.params.id);
  if (!block) throw new ErrorResponse("Block not found", 404);

  await Property.findByIdAndUpdate(block.property, {
    $pull: { blocks: block._id },
  });

  await ZoneSubArea.findByIdAndUpdate(block.zone, {
    $pull: { blocks: block._id },
  });

  await block.deleteOne();

  res.status(200).json({
    success: true,
    message: "Block deleted",
  });
});

