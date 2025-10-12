const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Owner = require("../models/Owner");

// @desc    Get all owners
// @route   GET /api/v1/owners
exports.getOwners = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const owners = await Owner.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Owner.countDocuments();

  res.status(200).json({
    success: true,
    count: owners.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    data: owners,
  });
});

// @desc    Create new owner
// @route   POST /api/v1/owners
exports.createOwner = asyncHandler(async (req, res) => {
  const {
    ownerName_en,
    ownerName_vi,
    ownerType_en,
    ownerType_vi,
    ownerNumber_en,
    ownerNumber_vi,
    ownerFacebook_en,
    ownerFacebook_vi,
    ownerNotes_en,
    ownerNotes_vi,
    photo,
    status,
  } = req.body;

  if (
    !ownerName_en ||
    !ownerName_vi ||
    !ownerType_en ||
    !ownerType_vi ||
    !ownerNumber_en ||
    !ownerNumber_vi
  ) {
    throw new ErrorResponse(
      "All English and Vietnamese fields for Name, Type, and Contact Number are required",
      400
    );
  }

  const newOwner = await Owner.create({
    ownerName: { en: ownerName_en, vi: ownerName_vi },
    ownerType: { en: ownerType_en, vi: ownerType_vi },
    ownerNumber: { en: ownerNumber_en, vi: ownerNumber_vi },
    ownerFacebook: { en: ownerFacebook_en, vi: ownerFacebook_vi },
    ownerNotes: { en: ownerNotes_en, vi: ownerNotes_vi },
    photo: photo || null, // Base64 string here
    status: status || "Active",
  });

  res.status(201).json({
    success: true,
    message: "Owner created successfully",
    data: newOwner,
  });
});

// @desc    Update owner
// @route   PUT /api/v1/owners/:id
exports.updateOwner = asyncHandler(async (req, res) => {
  const {
    ownerName_en,
    ownerName_vi,
    ownerType_en,
    ownerType_vi,
    ownerNumber_en,
    ownerNumber_vi,
    ownerFacebook_en,
    ownerFacebook_vi,
    ownerNotes_en,
    ownerNotes_vi,
    photo,
    status,
  } = req.body;

  const owner = await Owner.findById(req.params.id);
  if (!owner) throw new ErrorResponse("Owner not found", 404);

  owner.ownerName.en = ownerName_en ?? owner.ownerName.en;
  owner.ownerName.vi = ownerName_vi ?? owner.ownerName.vi;
  owner.ownerType.en = ownerType_en ?? owner.ownerType.en;
  owner.ownerType.vi = ownerType_vi ?? owner.ownerType.vi;
  owner.ownerNumber.en = ownerNumber_en ?? owner.ownerNumber.en;
  owner.ownerNumber.vi = ownerNumber_vi ?? owner.ownerNumber.vi;
  owner.ownerFacebook.en = ownerFacebook_en ?? owner.ownerFacebook.en;
  owner.ownerFacebook.vi = ownerFacebook_vi ?? owner.ownerFacebook.vi;
  owner.ownerNotes.en = ownerNotes_en ?? owner.ownerNotes.en;
  owner.ownerNotes.vi = ownerNotes_vi ?? owner.ownerNotes.vi;
  owner.status = status ?? owner.status;

  // ✅ Store Base64 directly
  if (photo) {
    owner.photo = photo;
  }

  await owner.save();

  res.status(200).json({
    success: true,
    message: "Owner updated successfully",
    data: owner,
  });
});

// @desc    Delete an owner
// @route   DELETE /api/v1/owners/:id
exports.deleteOwner = asyncHandler(async (req, res) => {
  const owner = await Owner.findById(req.params.id);
  if (!owner) throw new ErrorResponse("Owner not found", 404);

  await owner.deleteOne();

  res.status(200).json({
    success: true,
    message: "Owner deleted successfully",
  });
});
