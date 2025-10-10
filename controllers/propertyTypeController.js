const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const PropertyType = require("../models/PropertyType");

// @desc    Get all Property Types
// @route   GET /api/v1/propertytype
exports.getPropertyTypes = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const propertyTypes = await PropertyType.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await PropertyType.countDocuments();

    res.status(200).json({
        success: true,
        count: propertyTypes.length,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        data: propertyTypes,
    });
});

// @desc    Create a new Property Type
// @route   POST /api/v1/propertytype
exports.createPropertyType = asyncHandler(async (req, res) => {
    const { code_en, code_vi, name_en, name_vi, status } = req.body;

    if (!code_en || !code_vi || !name_en || !name_vi) {
        throw new ErrorResponse("All English and Vietnamese fields are required", 400);
    }

    const existing = await PropertyType.findOne({
        $or: [{ "code.en": code_en }, { "code.vi": code_vi }],
    });

    if (existing) {
        throw new ErrorResponse("Property Type code already exists", 400);
    }

    const propertyType = await PropertyType.create({
        code: { en: code_en, vi: code_vi },
        name: { en: name_en, vi: name_vi },
        status: status || "Active",
    });

    res.status(201).json({
        success: true,
        message: "Property Type created successfully",
        data: propertyType,
    });
});

// @desc    Update Property Type
// @route   PUT /api/v1/propertytype/:id
exports.updatePropertyType = asyncHandler(async (req, res) => {
    const { code_en, code_vi, name_en, name_vi, status } = req.body;

    const propertyType = await PropertyType.findById(req.params.id);
    if (!propertyType) throw new ErrorResponse("Property Type not found", 404);

    propertyType.code.en = code_en ?? propertyType.code.en;
    propertyType.code.vi = code_vi ?? propertyType.code.vi;
    propertyType.name.en = name_en ?? propertyType.name.en;
    propertyType.name.vi = name_vi ?? propertyType.name.vi;
    propertyType.status = status ?? propertyType.status;

    await propertyType.save();

    res.status(200).json({
        success: true,
        message: "Property Type updated successfully",
        data: propertyType,
    });
});

// @desc    Delete Property Type
// @route   DELETE /api/v1/propertytype/:id
exports.deletePropertyType = asyncHandler(async (req, res) => {
    const propertyType = await PropertyType.findById(req.params.id);
    if (!propertyType) throw new ErrorResponse("Property Type not found", 404);

    await propertyType.deleteOne();

    res.status(200).json({
        success: true,
        message: "Property Type deleted successfully",
    });
});
