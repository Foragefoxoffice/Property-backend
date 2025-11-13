const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const PropertyType = require("../models/PropertyType");

// @desc    Get all Property Types
// @route   GET /api/v1/propertytype
exports.getPropertyTypes = asyncHandler(async (req, res) => {
    const propertyTypes = await PropertyType.aggregate([
        { $addFields: { numericCode: { $toInt: "$code.en" } } },
        { $sort: { numericCode: 1 } }
    ]);

    res.status(200).json({
        success: true,
        data: propertyTypes,
    });
});


// @desc    Create a new Property Type
exports.createPropertyType = asyncHandler(async (req, res) => {
    const { name_en, name_vi, status } = req.body;

    if (!name_en || !name_vi) {
        throw new ErrorResponse("English & Vietnamese names are required", 400);
    }

    // Get existing numeric codes
    const existing = await PropertyType.find({}, { "code.en": 1 }).lean();

    const numericCodes = existing
        .map((r) => parseInt(r.code?.en))
        .filter((n) => !isNaN(n));

    let next = 1;
    if (numericCodes.length > 0) {
        next = Math.max(...numericCodes) + 1;
    }

    const autoCode = String(next).padStart(3, "0");

    const propertyType = await PropertyType.create({
        code: { en: autoCode, vi: autoCode },
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
