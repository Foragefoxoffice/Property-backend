const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Parking = require("../models/Parking");
const CreateProperty = require("../models/CreateProperty");

// @desc    Get all Parking Availability options
// @route   GET /api/v1/parking
exports.getParkings = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const parkings = await Parking.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await Parking.countDocuments();

    res.status(200).json({
        success: true,
        count: parkings.length,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        data: parkings,
    });
});

// @desc    Create Parking Availability
// @route   POST /api/v1/parking
exports.createParking = asyncHandler(async (req, res) => {
    const { code_en, code_vi, name_en, name_vi, status } = req.body;

    if (!code_en || !code_vi || !name_en || !name_vi) {
        throw new ErrorResponse("All English and Vietnamese fields are required", 400);
    }

    const existing = await Parking.findOne({
        $or: [{ "code.en": code_en }, { "code.vi": code_vi }],
    });
    if (existing) {
        throw new ErrorResponse("Parking code already exists", 400);
    }

    const newParking = await Parking.create({
        code: { en: code_en, vi: code_vi },
        name: { en: name_en, vi: name_vi },
        status: status || "Active",
    });

    res.status(201).json({
        success: true,
        message: "Parking Availability created successfully",
        data: newParking,
    });
});

// @desc    Update Parking Availability
// @route   PUT /api/v1/parking/:id
exports.updateParking = asyncHandler(async (req, res) => {
    const { code_en, code_vi, name_en, name_vi, status } = req.body;

    const parking = await Parking.findById(req.params.id);
    if (!parking) throw new ErrorResponse("Parking Availability not found", 404);

    parking.code.en = code_en ?? parking.code.en;
    parking.code.vi = code_vi ?? parking.code.vi;
    parking.name.en = name_en ?? parking.name.en;
    parking.name.vi = name_vi ?? parking.name.vi;
    parking.status = status ?? parking.status;

    await parking.save();

    res.status(200).json({
        success: true,
        message: "Parking Availability updated successfully",
        data: parking,
    });
});

// @desc    Delete Parking Availability
// @route   DELETE /api/v1/parking/:id
exports.deleteParking = asyncHandler(async (req, res) => {
    const parking = await Parking.findById(req.params.id);
    if (!parking) throw new ErrorResponse("Parking Availability not found", 404);

    const isUsed = await CreateProperty.exists({
        $or: [
            { "propertyUtility.propertyUtilityUnitName.en": parking.name.en },
            { "propertyUtility.propertyUtilityUnitName.vi": parking.name.vi }
        ]
    });

    if (isUsed) {
        return res.status(400).json({
            success: false,
            message: "Cannot delete this master data because it is present in a created property. Delete the property first."
        });
    }

    await parking.deleteOne();

    res.status(200).json({
        success: true,
        message: "Parking Availability deleted successfully",
    });
});
