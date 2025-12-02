const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const AvailabilityStatus = require("../models/AvailabilityStatus");
const CreateProperty = require("../models/CreateProperty");

// @desc    Get all Availability Statuses
exports.getAvailabilityStatuses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const statuses = await AvailabilityStatus.aggregate([
    {
      $addFields: {
        numericCode: { $toInt: "$code.en" }
      }
    },
    { $sort: { numericCode: 1 } }, // ASCENDING
    { $skip: skip },
    { $limit: Number(limit) }
  ]);

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
exports.createAvailabilityStatus = asyncHandler(async (req, res) => {
  const { name_en, name_vi, status } = req.body;

  if (!name_en || !name_vi) {
    throw new ErrorResponse("English and Vietnamese names are required", 400);
  }

  // ❌ Prevent duplicate name
  const existingStatus = await AvailabilityStatus.findOne({
    $or: [
      { "name.en": { $regex: new RegExp(`^${name_en}$`, "i") } },
      { "name.vi": { $regex: new RegExp(`^${name_vi}$`, "i") } }
    ]
  });

  if (existingStatus) {
    throw new ErrorResponse("Availability Status with this name already exists", 400);
  }

  // Fetch all existing statuses
  const all = await AvailabilityStatus.find().lean();

  // Extract only numeric codes
  const numericCodes = all
    .map(item => parseInt(item.code?.en))
    .filter(num => !isNaN(num)); // remove invalid numbers

  // Determine next code
  let nextNumber = 1;
  if (numericCodes.length > 0) {
    nextNumber = Math.max(...numericCodes) + 1;
  }

  const autoCode = String(nextNumber).padStart(3, "0");

  const newStatus = await AvailabilityStatus.create({
    code: { en: autoCode, vi: autoCode },
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

  // ❌ Prevent duplicate name on update
  if (name_en || name_vi) {
    const duplicateStatus = await AvailabilityStatus.findOne({
      _id: { $ne: availability._id },
      $or: [
        { "name.en": { $regex: new RegExp(`^${name_en || availability.name.en}$`, "i") } },
        { "name.vi": { $regex: new RegExp(`^${name_vi || availability.name.vi}$`, "i") } }
      ]
    });

    if (duplicateStatus) {
      throw new ErrorResponse("Availability Status with this name already exists", 400);
    }
  }

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

  const isUsed = await CreateProperty.exists({
    $or: [
      { "listingInformation.listingInformationAvailabilityStatus.en": availability.name.en },
      { "listingInformation.listingInformationAvailabilityStatus.vi": availability.name.vi }
    ]
  });

  if (isUsed) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete this master data because it is present in a created property. Delete the property first."
    });
  }

  await availability.deleteOne();

  res.status(200).json({
    success: true,
    message: "Availability Status deleted successfully",
  });
});
