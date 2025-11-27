const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Property = require("../models/Property");
const ZoneSubArea = require("../models/ZoneSubArea");
const Block = require("../models/Block");
const CreateProperty = require("../models/CreateProperty");

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

    // ❌ Prevent duplicate property name in EN or VI
    const existingProperty = await Property.findOne({
        $or: [
            { "name.en": name_en },
            { "name.vi": name_vi }
        ]
    });

    if (existingProperty) {
        throw new ErrorResponse(
            "A Project/Community with this name already exists.",
            400
        );
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

// ✅ DELETE Property (STRICT - prevents deletion if Zones, Blocks, OR Property Listings exist)
exports.deleteProperty = asyncHandler(async (req, res) => {
    const propertyId = req.params.id;

    const property = await Property.findById(propertyId);
    if (!property) {
        throw new ErrorResponse("Property not found", 404);
    }

    // ===== CHECK 1: Property's zones/blocks arrays =====
    const hasZonesInArray = property.zones && property.zones.length > 0;
    const hasBlocksInArray = property.blocks && property.blocks.length > 0;

    // ===== CHECK 2: Database documents (Zones & Blocks) =====
    const zoneCount = await ZoneSubArea.countDocuments({ property: propertyId });
    const zones = await ZoneSubArea.find({ property: propertyId }).select("_id");
    const zoneIds = zones.map(z => z._id);
    const blockCount = await Block.countDocuments({ zone: { $in: zoneIds } });
    const directBlockCount = await Block.countDocuments({ property: propertyId });

    // ===== CHECK 3: Usage in Property Listings (CreateProperty) =====
    // Check if the property name is used in any listing
    const listingCount = await CreateProperty.countDocuments({
        $or: [
            { "listingInformation.listingInformationProjectCommunity.en": property.name.en },
            { "listingInformation.listingInformationProjectCommunity.vi": property.name.vi }
        ]
    });

    // ===== STRICT PREVENTION =====
    if (
        hasZonesInArray ||
        hasBlocksInArray ||
        zoneCount > 0 ||
        blockCount > 0 ||
        directBlockCount > 0 ||
        listingCount > 0
    ) {
        let errorMessage = "Cannot delete project.";
        if (listingCount > 0) {
            errorMessage += " It is used in existing Property Listings.";
        } else {
            errorMessage += " Zone & Block data exist.";
        }

        throw new ErrorResponse(errorMessage, 400);
    }

    await property.deleteOne();

    res.status(200).json({
        success: true,
        message: "Project/Community deleted successfully",
    });
});
