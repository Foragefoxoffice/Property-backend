const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Unit = require("../models/Unit");

// @desc    Get all Units
// @route   GET /api/v1/unit
exports.getUnits = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const units = await Unit.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await Unit.countDocuments();

    res.status(200).json({
        success: true,
        count: units.length,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        data: units,
    });
});

// @desc    Create Unit
// @route   POST /api/v1/unit
exports.createUnit = asyncHandler(async (req, res) => {
    const { code_en, code_vi, name_en, name_vi, symbol_en, symbol_vi, status } = req.body;

    if (!code_en || !code_vi || !name_en || !name_vi || !symbol_en || !symbol_vi) {
        throw new ErrorResponse("All English and Vietnamese fields are required", 400);
    }

    const existing = await Unit.findOne({
        $or: [{ "code.en": code_en }, { "code.vi": code_vi }],
    });
    if (existing) {
        throw new ErrorResponse("Unit code already exists", 400);
    }

    const newUnit = await Unit.create({
        code: { en: code_en, vi: code_vi },
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
    const { code_en, code_vi, name_en, name_vi, symbol_en, symbol_vi, status } = req.body;

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
