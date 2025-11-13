const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Furnishing = require("../models/Furnishing");

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
exports.deleteFurnishing = asyncHandler(async (req, res) => {
    const furnishing = await Furnishing.findById(req.params.id);
    if (!furnishing) throw new ErrorResponse("Furnishing not found", 404);

    await furnishing.deleteOne();

    res.status(200).json({
        success: true,
        message: "Furnishing deleted successfully",
    });
});
