const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Unit = require("../models/Unit");

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
exports.deleteUnit = asyncHandler(async (req, res) => {
  const unit = await Unit.findById(req.params.id);
  if (!unit) throw new ErrorResponse("Unit not found", 404);

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
