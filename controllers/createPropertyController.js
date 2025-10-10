const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Property = require("../models/CreateProperty");

// 📍 GET all properties (paginated)
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

// 📍 GET single property
exports.getPropertyById = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);
    if (!property) throw new ErrorResponse("Property not found", 404);
    res.status(200).json({ success: true, data: property });
});

// 📍 CREATE new property
exports.createProperty = asyncHandler(async (req, res) => {
    const property = await Property.create(req.body);
    res.status(201).json({
        success: true,
        message: "Property created successfully",
        data: property,
    });
});

// 📍 UPDATE property (for steps 2 & 3)
exports.updateProperty = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);
    if (!property) throw new ErrorResponse("Property not found", 404);

    Object.assign(property, req.body);
    await property.save();

    res.status(200).json({
        success: true,
        message: "Property updated successfully",
        data: property,
    });
});

// 📍 DELETE property
exports.deleteProperty = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);
    if (!property) throw new ErrorResponse("Property not found", 404);

    await property.deleteOne();
    res.status(200).json({
        success: true,
        message: "Property deleted successfully",
    });
});
