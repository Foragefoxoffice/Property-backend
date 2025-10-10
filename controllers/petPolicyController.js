const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const PetPolicy = require("../models/PetPolicy");

// @desc    Get all Pet Policies
// @route   GET /api/v1/petpolicy
exports.getPetPolicies = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const petPolicies = await PetPolicy.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await PetPolicy.countDocuments();

    res.status(200).json({
        success: true,
        count: petPolicies.length,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        data: petPolicies,
    });
});

// @desc    Create a new Pet Policy
// @route   POST /api/v1/petpolicy
exports.createPetPolicy = asyncHandler(async (req, res) => {
    const { code_en, code_vi, name_en, name_vi, status } = req.body;

    if (!code_en || !code_vi || !name_en || !name_vi) {
        throw new ErrorResponse("All English and Vietnamese fields are required", 400);
    }

    const existing = await PetPolicy.findOne({
        $or: [{ "code.en": code_en }, { "code.vi": code_vi }],
    });
    if (existing) {
        throw new ErrorResponse("Pet Policy code already exists", 400);
    }

    const newPetPolicy = await PetPolicy.create({
        code: { en: code_en, vi: code_vi },
        name: { en: name_en, vi: name_vi },
        status: status || "Active",
    });

    res.status(201).json({
        success: true,
        message: "Pet Policy created successfully",
        data: newPetPolicy,
    });
});

// @desc    Update Pet Policy
// @route   PUT /api/v1/petpolicy/:id
exports.updatePetPolicy = asyncHandler(async (req, res) => {
    const { code_en, code_vi, name_en, name_vi, status } = req.body;

    const policy = await PetPolicy.findById(req.params.id);
    if (!policy) throw new ErrorResponse("Pet Policy not found", 404);

    policy.code.en = code_en ?? policy.code.en;
    policy.code.vi = code_vi ?? policy.code.vi;
    policy.name.en = name_en ?? policy.name.en;
    policy.name.vi = name_vi ?? policy.name.vi;
    policy.status = status ?? policy.status;

    await policy.save();

    res.status(200).json({
        success: true,
        message: "Pet Policy updated successfully",
        data: policy,
    });
});

// @desc    Delete Pet Policy
// @route   DELETE /api/v1/petpolicy/:id
exports.deletePetPolicy = asyncHandler(async (req, res) => {
    const policy = await PetPolicy.findById(req.params.id);
    if (!policy) throw new ErrorResponse("Pet Policy not found", 404);

    await policy.deleteOne();

    res.status(200).json({
        success: true,
        message: "Pet Policy deleted successfully",
    });
});
