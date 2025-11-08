const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Block = require("../models/Block");

// ✅ GET all blocks
exports.getBlocks = asyncHandler(async (req, res) => {
  const blocks = await Block.find()
    .populate("property")
    .populate("zone");

  res.status(200).json({ success: true, data: blocks });
});


// ✅ CREATE
exports.createBlock = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, property, zone } = req.body;

  if (!property) throw new ErrorResponse("Property is required", 400);
  if (!zone) throw new ErrorResponse("Zone is required", 400);

  const block = await Block.create({
    property,
    zone,
    code: { en: code_en, vi: code_vi },
    name: { en: name_en, vi: name_vi },
  });

  res.status(201).json({ success: true, data: block });
});

// ✅ UPDATE
exports.updateBlock = asyncHandler(async (req, res) => {
  const block = await Block.findById(req.params.id);
  if (!block) throw new ErrorResponse("Block not found", 404);

  const { code_en, code_vi, name_en, name_vi, property, zone, status } = req.body;

  // ✅ Update codes
  block.code.en = code_en ?? block.code.en;
  block.code.vi = code_vi ?? block.code.vi;

  // ✅ Update names
  block.name.en = name_en ?? block.name.en;
  block.name.vi = name_vi ?? block.name.vi;

  // ✅ Update status
  block.status = status ?? block.status;

  // ✅ Update property (Project / Community)
  if (property) block.property = property;

  // ✅ Update zone (Area / Zone)
  if (zone) block.zone = zone;

  await block.save();

  res.status(200).json({
    success: true,
    message: "Block updated",
    data: block,
  });
});


// ✅ DELETE
exports.deleteBlock = asyncHandler(async (req, res) => {
  const block = await Block.findById(req.params.id);
  if (!block) throw new ErrorResponse("Block not found", 404);

  await block.deleteOne();

  res.status(200).json({
    success: true,
    message: "Block deleted",
  });
});
