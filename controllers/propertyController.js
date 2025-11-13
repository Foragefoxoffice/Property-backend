const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Property = require("../models/Property");
const ZoneSubArea = require("../models/ZoneSubArea");
const Block = require("../models/Block");

// ✅ GET all properties (with zones + blocks)
exports.getProperties = asyncHandler(async (req, res) => {
    const properties = await Property.aggregate([
        {
            $addFields: {
                numericCode: { $toInt: "$code.en" }
            }
        },
        { $sort: { numericCode: 1 } },
        {
            $lookup: {
                from: "zonesubareas",
                localField: "zones",
                foreignField: "_id",
                as: "zones"
            }
        },
        {
            $lookup: {
                from: "blocks",
                localField: "blocks",
                foreignField: "_id",
                as: "blocks"
            }
        }
    ]);

    res.status(200).json({
        success: true,
        count: properties.length,
        data: properties,
    });
});


// ✅ CREATE Property
exports.createProperty = asyncHandler(async (req, res) => {
    const { name_en, name_vi, status } = req.body;

    if (!name_en || !name_vi) {
        throw new ErrorResponse("English & Vietnamese names are required", 400);
    }

    // Generate next code
    const existing = await Property.find({}, { "code.en": 1 }).lean();
    const numericCodes = existing
        .map((r) => parseInt(r.code?.en))
        .filter((n) => !isNaN(n));

    let next = 1;
    if (numericCodes.length > 0) {
        next = Math.max(...numericCodes) + 1;
    }

    const autoCode = String(next).padStart(3, "0");

    const property = await Property.create({
        code: { en: autoCode, vi: autoCode },
        name: { en: name_en, vi: name_vi },
        status: status || "Active",
    });

    res.status(201).json({
        success: true,
        message: "Property created successfully",
        data: property,
    });
});


// ✅ UPDATE Property
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

// ✅ DELETE Property (ALSO deletes Zones & Blocks under it)
exports.deleteProperty = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);
    if (!property) throw new ErrorResponse("Property not found", 404);

    // ✅ Delete related Zones
    await ZoneSubArea.deleteMany({ property: property._id });

    // ✅ Delete related Blocks
    await Block.deleteMany({ property: property._id });

    await property.deleteOne();

    res.status(200).json({
        success: true,
        message: "Property deleted successfully",
    });
});
