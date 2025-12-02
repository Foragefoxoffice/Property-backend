const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Furnishing = require("../models/Furnishing");
const CreateProperty = require("../models/CreateProperty");

// =====================================
// GET ALL (Sorted by Numeric Code)
// =====================================
exports.getFurnishings = asyncHandler(async (req, res) => {
    const furnishings = await Furnishing.aggregate([
        {
            $addFields: {
                numericCode: { $toInt: "$code.en" }
            }
        },
        { $sort: { numericCode: 1 } } // Ascending
    ]);

    res.status(200).json({
        success: true,
        data: furnishings,
    });
});

// =====================================
// CREATE (AUTO-GENERATE CODE)
// =====================================
exports.createFurnishing = asyncHandler(async (req, res) => {
    const { name_en, name_vi, status } = req.body;

    // Validate only names (codes are auto-generated)
    if (!name_en || !name_vi) {
        throw new ErrorResponse("English & Vietnamese names are required", 400);
    }

    // ❌ Prevent duplicate name
    const existingFurnishing = await Furnishing.findOne({
        $or: [
            { "name.en": { $regex: new RegExp(`^${name_en}$`, "i") } },
            { "name.vi": { $regex: new RegExp(`^${name_vi}$`, "i") } }
        ]
    });

    if (existingFurnishing) {
        throw new ErrorResponse("Furnishing with this name already exists", 400);
    }

    // Get existing numeric codes
    const existing = await Furnishing.find({}, { "code.en": 1 }).lean();
    const nums = existing
        .map(x => parseInt(x.code?.en))
        .filter(n => !isNaN(n));

    // Auto-generate next code
    const nextNumber = nums.length ? Math.max(...nums) + 1 : 1;
    const autoCode = String(nextNumber).padStart(3, "0");

    // Create new furnishing
    const newFurnishing = await Furnishing.create({
        code: { en: autoCode, vi: autoCode },
        name: { en: name_en, vi: name_vi },
        status: status || "Active",
    });

    res.status(201).json({
        success: true,
        message: "Furnishing created successfully",
        data: newFurnishing,
    });
});

// =====================================
// UPDATE (Name + Status only)
// =====================================
exports.updateFurnishing = asyncHandler(async (req, res) => {
    const { name_en, name_vi, status } = req.body;

    const furnishing = await Furnishing.findById(req.params.id);
    if (!furnishing) throw new ErrorResponse("Furnishing not found", 404);

    // ❌ Prevent duplicate name on update
    if (name_en || name_vi) {
        const duplicateFurnishing = await Furnishing.findOne({
            _id: { $ne: furnishing._id },
            $or: [
                { "name.en": { $regex: new RegExp(`^${name_en || furnishing.name.en}$`, "i") } },
                { "name.vi": { $regex: new RegExp(`^${name_vi || furnishing.name.vi}$`, "i") } }
            ]
        });

        if (duplicateFurnishing) {
            throw new ErrorResponse("Furnishing with this name already exists", 400);
        }
    }

    // Update only editable fields
    if (name_en) furnishing.name.en = name_en;
    if (name_vi) furnishing.name.vi = name_vi;
    if (status) furnishing.status = status;

    await furnishing.save();

    res.status(200).json({
        success: true,
        message: "Furnishing updated successfully",
        data: furnishing,
    });
});

// =====================================
// DELETE
// =====================================
// =====================================
// DELETE
// =====================================
exports.deleteFurnishing = asyncHandler(async (req, res) => {
    const furnishing = await Furnishing.findById(req.params.id);
    if (!furnishing) throw new ErrorResponse("Furnishing not found", 404);

    const isUsed = await CreateProperty.exists({
        $or: [
            { "propertyInformation.informationFurnishing.en": furnishing.name.en },
            { "propertyInformation.informationFurnishing.vi": furnishing.name.vi }
        ]
    });

    if (isUsed) {
        return res.status(400).json({
            success: false,
            message: "Cannot delete this master data because it is present in a created property. Delete the property first."
        });
    }

    await furnishing.deleteOne();

    res.status(200).json({
        success: true,
        message: "Furnishing deleted successfully",
    });
});
