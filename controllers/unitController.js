const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Unit = require("../models/Unit");
const CreateProperty = require("../models/CreateProperty");

// @desc    Get all Units
exports.getUnits = asyncHandler(async (req, res) => {
  const units = await Unit.aggregate([
    {
      $addFields: {
        numericCode: { $toInt: "$code.en" }
      }
    },
    { $sort: { numericCode: 1 } }
  ]);

  res.status(200).json({
    success: true,
    count: units.length,
    data: units,
  });
});


// @desc    Create Unit
exports.createUnit = asyncHandler(async (req, res) => {
  const { name_en, name_vi, symbol_en, symbol_vi, status } = req.body;

  if (!name_en || !name_vi || !symbol_en || !symbol_vi) {
    throw new ErrorResponse("English & Vietnamese names and symbols are required", 400);
  }

  // ❌ Prevent duplicate name
  const existingName = await Unit.findOne({
    $or: [
      { "name.en": { $regex: new RegExp(`^${name_en}$`, "i") } },
      { "name.vi": { $regex: new RegExp(`^${name_vi}$`, "i") } }
    ]
  });

  if (existingName) {
    throw new ErrorResponse("Unit with this name already exists", 400);
  }

  // Generate next unit code
  const existing = await Unit.find({}, { "code.en": 1 }).lean();
  const numericCodes = existing
    .map((r) => parseInt(r.code?.en))
    .filter((n) => !isNaN(n));

  let next = 1;
  if (numericCodes.length > 0) {
    next = Math.max(...numericCodes) + 1;
  }

  const autoCode = String(next).padStart(3, "0");

  const newUnit = await Unit.create({
    code: { en: autoCode, vi: autoCode },
    name: { en: name_en, vi: name_vi },
    symbol: { en: symbol_en, vi: symbol_vi },
    status: status || "Active",
  });

  res.status(201).json({
    success: true,
    message: "Unit created successfully",
    data: newUnit,
  });
});


// @desc    Update Unit
// @route   PUT /api/v1/unit/:id
exports.updateUnit = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, symbol_en, symbol_vi, status } =
    req.body;

  const unit = await Unit.findById(req.params.id);
  if (!unit) throw new ErrorResponse("Unit not found", 404);

  // ❌ Prevent duplicate name on update
  if (name_en || name_vi) {
    const duplicateName = await Unit.findOne({
      _id: { $ne: unit._id },
      $or: [
        { "name.en": { $regex: new RegExp(`^${name_en || unit.name.en}$`, "i") } },
        { "name.vi": { $regex: new RegExp(`^${name_vi || unit.name.vi}$`, "i") } }
      ]
    });

    if (duplicateName) {
      throw new ErrorResponse("Unit with this name already exists", 400);
    }
  }

  unit.code.en = code_en ?? unit.code.en;
  unit.code.vi = code_vi ?? unit.code.vi;
  unit.name.en = name_en ?? unit.name.en;
  unit.name.vi = name_vi ?? unit.name.vi;
  unit.symbol.en = symbol_en ?? unit.symbol.en;
  unit.symbol.vi = symbol_vi ?? unit.symbol.vi;
  unit.status = status ?? unit.status;

  await unit.save();

  res.status(200).json({
    success: true,
    message: "Unit updated successfully",
    data: unit,
  });
});

// @desc    Delete Unit
// @route   DELETE /api/v1/unit/:id
// @desc    Delete Unit
// @route   DELETE /api/v1/unit/:id
exports.deleteUnit = asyncHandler(async (req, res) => {
  const unit = await Unit.findById(req.params.id);
  if (!unit) throw new ErrorResponse("Unit not found", 404);

  const isUsed = await CreateProperty.exists({
    $or: [
      { "propertyInformation.informationUnit.en": unit.name.en },
      { "propertyInformation.informationUnit.vi": unit.name.vi }
    ]
  });

  if (isUsed) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete this master data because it is present in a created property. Delete the property first."
    });
  }

  await unit.deleteOne();

  res.status(200).json({
    success: true,
    message: "Unit deleted successfully",
  });
});

// @desc    Mark a Unit as Default
// @route   PUT /api/v1/unit/:id/default
exports.markAsDefault = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const unit = await Unit.findById(id);
  if (!unit) throw new ErrorResponse("Unit not found", 404);

  // Remove default from all others
  await Unit.updateMany({}, { $set: { isDefault: false } });

  // Mark this one as default
  unit.isDefault = true;
  await unit.save();

  res.status(200).json({
    success: true,
    message: "Unit marked as default successfully",
    data: unit,
  });
});
