const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Property = require("../models/Property");

// @desc    Get all properties
// @route   GET /api/v1/property
exports.getProperties = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const properties = await Property.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await Property.countDocuments();

    res.status(200).json({
        success: true,
        count: properties.length,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        data: properties,
    });
});

// @desc    Create a new property
// @route   POST /api/v1/property
exports.createProperty = asyncHandler(async (req, res) => {
    const { code_en, code_vi, name_en, name_vi, status } = req.body;

    if (!code_en || !code_vi || !name_en || !name_vi) {
        throw new ErrorResponse("All English and Vietnamese fields are required", 400);
    }

    // Check if any English or Vietnamese code already exists
    const existing = await Property.findOne({
        $or: [{ "code.en": code_en }, { "code.vi": code_vi }],
    });
    if (existing) {
        throw new ErrorResponse("Property code already exists", 400);
    }

    const property = await Property.create({
        code: { en: code_en, vi: code_vi },
        name: { en: name_en, vi: name_vi },
        status: status || "Active",
    });

    res.status(201).json({
        success: true,
        message: "Property created successfully",
        data: property,
    });
});

// @desc    Update property
// @route   PUT /api/v1/property/:id
exports.updateProperty = asyncHandler(async (req, res) => {
    const { code_en, code_vi, name_en, name_vi, status } = req.body;

    const property = await Property.findById(req.params.id);
    if (!property) throw new ErrorResponse("Property not found", 404);

    property.code.en = code_en ?? property.code.en;
    property.code.vi = code_vi ?? property.code.vi;
    property.name.en = name_en ?? property.name.en;
    property.name.vi = name_vi ?? property.name.vi;
    property.status = status ?? property.status;

    await property.save();

    res.status(200).json({
        success: true,
        message: "Property updated successfully",
        data: property,
    });
});

// @desc    Delete property
// @route   DELETE /api/v1/property/:id
exports.deleteProperty = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);
    if (!property) throw new ErrorResponse("Property not found", 404);

    await property.deleteOne();

    res.status(200).json({
        success: true,
        message: "Property deleted successfully",
    });
});
