const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const AvailabilityStatus = require("../models/AvailabilityStatus");

// @desc    Get all Availability Statuses
// @route   GET /api/v1/availabilitystatus
exports.getAvailabilityStatuses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const statuses = await AvailabilityStatus.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await AvailabilityStatus.countDocuments();

  res.status(200).json({
    success: true,
    count: statuses.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    data: statuses,
  });
});

// @desc    Create Availability Status
// @route   POST /api/v1/availabilitystatus
exports.createAvailabilityStatus = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, status } = req.body;

  if (!code_en || !code_vi || !name_en || !name_vi) {
    throw new ErrorResponse(
      "All English and Vietnamese fields are required",
      400
    );
  }

  const existing = await AvailabilityStatus.findOne({
    $or: [{ "code.en": code_en }, { "code.vi": code_vi }],
  });
  if (existing) {
    throw new ErrorResponse("Availability Status code already exists", 400);
  }

  const newStatus = await AvailabilityStatus.create({
    code: { en: code_en, vi: code_vi },
    name: { en: name_en, vi: name_vi },
    status: status || "Active",
  });

  res.status(201).json({
    success: true,
    message: "Availability Status created successfully",
    data: newStatus,
  });
});

// @desc    Update Availability Status
// @route   PUT /api/v1/availabilitystatus/:id
exports.updateAvailabilityStatus = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, status } = req.body;

  const availability = await AvailabilityStatus.findById(req.params.id);
  if (!availability)
    throw new ErrorResponse("Availability Status not found", 404);

  availability.code.en = code_en ?? availability.code.en;
  availability.code.vi = code_vi ?? availability.code.vi;
  availability.name.en = name_en ?? availability.name.en;
  availability.name.vi = name_vi ?? availability.name.vi;
  availability.status = status ?? availability.status;

  await availability.save();

  res.status(200).json({
    success: true,
    message: "Availability Status updated successfully",
    data: availability,
  });
});

// @desc    Delete Availability Status
// @route   DELETE /api/v1/availabilitystatus/:id
exports.deleteAvailabilityStatus = asyncHandler(async (req, res) => {
  const availability = await AvailabilityStatus.findById(req.params.id);
  if (!availability)
    throw new ErrorResponse("Availability Status not found", 404);

  await availability.deleteOne();

  res.status(200).json({
    success: true,
    message: "Availability Status deleted successfully",
  });
});
