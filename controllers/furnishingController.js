const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Furnishing = require("../models/Parking");

// @desc    Get all Furnishing options
// @route   GET /api/v1/furnishing
exports.getFurnishings = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const furnishings = await Furnishing.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await Furnishing.countDocuments();

    res.status(200).json({
        success: true,
        count: furnishings.length,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        data: furnishings,
    });
});

// @desc    Create a new Furnishing option
// @route   POST /api/v1/furnishing
exports.createFurnishing = asyncHandler(async (req, res) => {
    const { code_en, code_vi, name_en, name_vi, status } = req.body;

    if (!code_en || !code_vi || !name_en || !name_vi) {
        throw new ErrorResponse("All English and Vietnamese fields are required", 400);
    }

    const existing = await Furnishing.findOne({
        $or: [{ "code.en": code_en }, { "code.vi": code_vi }],
    });
    if (existing) {
        throw new ErrorResponse("Furnishing code already exists", 400);
    }

    const newFurnishing = await Furnishing.create({
        code: { en: code_en, vi: code_vi },
        name: { en: name_en, vi: name_vi },
        status: status || "Active",
    });

    res.status(201).json({
        success: true,
        message: "Furnishing created successfully",
        data: newFurnishing,
    });
});

// @desc    Update Furnishing
// @route   PUT /api/v1/furnishing/:id
exports.updateFurnishing = asyncHandler(async (req, res) => {
    const { code_en, code_vi, name_en, name_vi, status } = req.body;

    const furnishing = await Furnishing.findById(req.params.id);
    if (!furnishing) throw new ErrorResponse("Furnishing not found", 404);

    furnishing.code.en = code_en ?? furnishing.code.en;
    furnishing.code.vi = code_vi ?? furnishing.code.vi;
    furnishing.name.en = name_en ?? furnishing.name.en;
    furnishing.name.vi = name_vi ?? furnishing.name.vi;
    furnishing.status = status ?? furnishing.status;

    await furnishing.save();

    res.status(200).json({
        success: true,
        message: "Furnishing updated successfully",
        data: furnishing,
    });
});

// @desc    Delete Furnishing
// @route   DELETE /api/v1/furnishing/:id
exports.deleteFurnishing = asyncHandler(async (req, res) => {
    const furnishing = await Furnishing.findById(req.params.id);
    if (!furnishing) throw new ErrorResponse("Furnishing not found", 404);

    await furnishing.deleteOne();

    res.status(200).json({
        success: true,
        message: "Furnishing deleted successfully",
    });
});
