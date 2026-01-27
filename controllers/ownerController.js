const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Owner = require("../models/Owner");
const CreateProperty = require("../models/CreateProperty");

// GET /api/v1/owners
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

// POST /api/v1/owners
exports.createOwner = asyncHandler(async (req, res) => {
  const {
    ownerName_en,
    ownerName_vi,
    gender,

    phoneNumbers = [],       // ✅ FIXED
    emailAddresses = [],     // ✅ FIXED

    socialMedia_iconName = [],
    socialMedia_link_en = [],
    socialMedia_link_vi = [],

    ownerNotes_en,
    ownerNotes_vi,
    status,
  } = req.body;

  if (!ownerName_en || !gender) {
    throw new ErrorResponse("Required fields missing", 400);
  }

  // Check if any phone number already exists
  if (phoneNumbers && Array.isArray(phoneNumbers) && phoneNumbers.length > 0) {
    const validPhones = phoneNumbers.filter((p) => p && p.trim() !== "");

    for (const phone of validPhones) {
      const normalizedPhone = phone.trim().replace(/[\s\-\(\)]/g, "");
      
      // Find all owners and check their phone numbers
      const allOwners = await Owner.find({});
      for (const owner of allOwners) {
        if (owner.phoneNumbers && Array.isArray(owner.phoneNumbers)) {
          for (const existingPhone of owner.phoneNumbers) {
            const normalizedExisting = existingPhone.trim().replace(/[\s\-\(\)]/g, "");
            if (normalizedExisting === normalizedPhone) {
              throw new ErrorResponse(
                `Phone number ${phone} already exists for landlord: ${owner.ownerName.en}`,
                400
              );
            }
          }
        }
      }
    }
  }

  const newOwner = await Owner.create({
    ownerName: {
      en: ownerName_en,
      vi: ownerName_vi || ownerName_en   // ✅ Auto copy 
    },
    gender,
    phoneNumbers,
    emailAddresses,

    socialMedia_iconName,
    socialMedia_link_en,
    socialMedia_link_vi,

    ownerNotes: { en: ownerNotes_en, vi: ownerNotes_vi },
    status: status || "Active",
  });

  res.status(201).json({
    success: true,
    message: "Owner created successfully",
    data: newOwner,
  });
});


// PUT /api/v1/owners/:id
exports.updateOwner = asyncHandler(async (req, res) => {
  const owner = await Owner.findById(req.params.id);
  if (!owner) throw new ErrorResponse("Owner not found", 404);

  const d = req.body;

  owner.ownerName.en = d.ownerName_en ?? owner.ownerName.en;
  owner.ownerName.vi = d.ownerName_vi ?? owner.ownerName.vi;

  owner.gender = d.gender ?? owner.gender;

  if (Array.isArray(d.phoneNumbers)) {
    const validPhones = d.phoneNumbers.filter((p) => p && p.trim() !== "");
    
    for (const phone of validPhones) {
      const normalizedPhone = phone.trim().replace(/[\s\-\(\)]/g, "");
      
      // Find all owners except current one and check their phone numbers
      const allOwners = await Owner.find({ _id: { $ne: owner._id } });
      for (const existingOwner of allOwners) {
        if (existingOwner.phoneNumbers && Array.isArray(existingOwner.phoneNumbers)) {
          for (const existingPhone of existingOwner.phoneNumbers) {
            const normalizedExisting = existingPhone.trim().replace(/[\s\-\(\)]/g, "");
            if (normalizedExisting === normalizedPhone) {
              throw new ErrorResponse(
                `Phone number ${phone} already exists for landlord: ${existingOwner.ownerName.en}`,
                400
              );
            }
          }
        }
      }
    }
    owner.phoneNumbers = d.phoneNumbers;
  }

  if (Array.isArray(d.emailAddresses))
    owner.emailAddresses = d.emailAddresses;

  if (Array.isArray(d.socialMedia_iconName))
    owner.socialMedia_iconName = d.socialMedia_iconName;

  if (Array.isArray(d.socialMedia_link_en))
    owner.socialMedia_link_en = d.socialMedia_link_en;

  if (Array.isArray(d.socialMedia_link_vi))
    owner.socialMedia_link_vi = d.socialMedia_link_vi;

  owner.ownerNotes.en = d.ownerNotes_en ?? owner.ownerNotes.en;
  owner.ownerNotes.vi = d.ownerNotes_vi ?? owner.ownerNotes.vi;

  owner.status = d.status ?? owner.status;

  await owner.save();

  res.status(200).json({
    success: true,
    message: "Owner updated successfully",
    data: owner,
  });
});


// DELETE /api/v1/owners/:id
exports.deleteOwner = asyncHandler(async (req, res) => {
  const owner = await Owner.findById(req.params.id);
  if (!owner) throw new ErrorResponse("Owner not found", 404);

  const isUsed = await CreateProperty.exists({
    $or: [
      { "contactManagement.contactManagementOwner.en": owner.ownerName.en },
      { "contactManagement.contactManagementOwner.vi": owner.ownerName.vi }
    ]
  });

  if (isUsed) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete this master data because it is present in a created property. Delete the property first."
    });
  }

  await owner.deleteOne();

  res.status(200).json({
    success: true,
    message: "Owner deleted successfully",
  });
});
