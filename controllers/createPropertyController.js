const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const CreateProperty = require("../models/CreateProperty");
const ZoneSubArea = require("../models/ZoneSubArea");
const Owner = require("../models/Owner");
const Role = require("../models/Role");
const mongoose = require("mongoose");

/* =========================================================
   🧰 Helpers: Localized Fields
========================================================= */
function normalizeLocalized(val) {
  if (!val) return { en: "", vi: "" };
  if (typeof val === "string") return { en: val, vi: val };
  if (typeof val === "object") {
    return {
      en: val.en || val.vi || "",
      vi: val.vi || val.en || "",
    };
  }
  return { en: "", vi: "" };
}

function deepNormalizeLocalized(data) {
  if (!data || typeof data !== "object") return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => deepNormalizeLocalized(item));
  }

  for (const key in data) {
    if (!Object.hasOwn(data, key)) continue;
    const val = data[key];

    if (key === "metaKeywords" && typeof val === "object" && val !== null) {
      data[key] = {
        en: Array.isArray(val.en) ? val.en : [],
        vi: Array.isArray(val.vi) ? val.vi : [],
      };
      continue;
    }

    if (val && typeof val === "object" && ("en" in val || "vi" in val)) {
      data[key] = normalizeLocalized(val);
    } else if (Array.isArray(val)) {
      data[key] = val.map(item => deepNormalizeLocalized(item));
    } else if (typeof val === "object" && val !== null) {
      data[key] = deepNormalizeLocalized(val);
    } else {
      data[key] = val;
    }
  }
  return data;
}

/* =========================================================
   🔢 Generate Next Property ID (Sale / Lease / Homestay)
========================================================= */
async function generateNextPropertyId(transactionType) {
  const prefixes = {
    Sale: "SAL-",
    Lease: "LSE-",
    "Home Stay": "HST-",
  };

  const prefix = prefixes[transactionType] || "UNK-";

  const lastProperty = await CreateProperty.findOne({
    "listingInformation.listingInformationPropertyId": {
      $regex: `^${prefix}\\d+$`,
    },
  })
    .sort({ createdAt: -1 })
    .select("listingInformation.listingInformationPropertyId")
    .lean();

  let nextId = `${prefix}0001`;

  if (lastProperty) {
    const lastId = lastProperty.listingInformation.listingInformationPropertyId;
    const numberPart = parseInt(lastId.replace(prefix, ""), 10);
    nextId = `${prefix}${String(numberPart + 1).padStart(4, "0")}`;
  }

  return nextId;
}

/**
 * Helper to validate if Property No is unique within a Section
 * @param {Object} propertyNo - {en, vi}
 * @param {Object|String} transactionType - {en, vi} or string
 * @param {String} excludeId - ID to exclude (for updates)
 */
async function validatePropertyNoUnique(propertyNo, transactionType, excludeId = null) {
  if (!propertyNo || (!propertyNo.en && !propertyNo.vi)) return;

  const transTypeEn = transactionType?.en || transactionType;
  const transTypeVi = transactionType?.vi || transTypeEn;
  const propNoEn = propertyNo.en;
  const propNoVi = propertyNo.vi;

  const query = {
    status: { $ne: "Archived" },
    $or: [
      { "listingInformation.listingInformationTransactionType.en": transTypeEn },
      { "listingInformation.listingInformationTransactionType.vi": transTypeEn },
      { "listingInformation.listingInformationTransactionType.en": transTypeVi },
      { "listingInformation.listingInformationTransactionType.vi": transTypeVi },
    ],
    $and: [
      {
        $or: [
          { "listingInformation.listingInformationPropertyNo.en": propNoEn },
          { "listingInformation.listingInformationPropertyNo.vi": propNoEn },
          { "listingInformation.listingInformationPropertyNo.en": propNoVi },
          { "listingInformation.listingInformationPropertyNo.vi": propNoVi },
        ].filter(cond => Object.values(cond)[0] !== "")
      }
    ]
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existingProperty = await CreateProperty.findOne(query);

  if (existingProperty) {
    throw new ErrorResponse(
      `Property No "${propNoEn || propNoVi}" already exists in the ${transTypeEn} section.`,
      400
    );
  }
}

/* =========================================================
   🏠 CREATE PROPERTY
========================================================= */
exports.createProperty = asyncHandler(async (req, res) => {
  try {
    // Log data size instead of full content to avoid overflow
    const bodySize = JSON.stringify(req.body).length;
    console.log("📥 Incoming Request Body Size:", bodySize, "bytes", `(${(bodySize / 1024 / 1024).toFixed(2)} MB)`);
    console.log("📥 Request Body Keys:", Object.keys(req.body));

    // Check image sizes
    if (req.body.imagesVideos) {
      console.log("🖼️ Images Count:", req.body.imagesVideos.propertyImages?.length || 0);
      console.log("🎥 Videos Count:", req.body.imagesVideos.propertyVideo?.length || 0);
      console.log("📐 Floor Plans Count:", req.body.imagesVideos.floorPlan?.length || 0);

      // Log individual image sizes
      if (req.body.imagesVideos.propertyImages) {
        req.body.imagesVideos.propertyImages.forEach((img, idx) => {
          const imgSize = img ? img.length : 0;
          console.log(`  Image ${idx + 1} size: ${(imgSize / 1024).toFixed(2)} KB`);
        });
      }
    }

    const body = deepNormalizeLocalized(req.body || {});
    const normalizedSize = JSON.stringify(body).length;
    console.log("✅ After deepNormalizeLocalized Size:", normalizedSize, "bytes", `(${(normalizedSize / 1024 / 1024).toFixed(2)} MB)`);

    // MongoDB BSON document size limit is 16MB
    const MAX_BSON_SIZE = 16 * 1024 * 1024; // 16MB in bytes
    if (normalizedSize > MAX_BSON_SIZE) {
      throw new ErrorResponse(
        `Document size (${(normalizedSize / 1024 / 1024).toFixed(2)} MB) exceeds MongoDB limit of 16MB. Please reduce image sizes or use file storage.`,
        400
      );
    }

    // ✅ If frontend already sent propertyId, DO NOT regenerate
    if (!body.listingInformation?.listingInformationPropertyId) {
      const transactionType =
        body.listingInformation?.listingInformationTransactionType?.en ||
        body.listingInformation?.listingInformationTransactionType;

      if (!transactionType)
        throw new ErrorResponse("Transaction type is required", 400);

      const propertyId = await generateNextPropertyId(transactionType);
      body.listingInformation.listingInformationPropertyId = propertyId;
    }

    // ✅ Enforce Approval: Non-approvers cannot Publish directly
    if (req.user && req.user.role) {
      const userRole = await Role.findOne({ name: req.user.role });

      // If user is approver, auto-approve and publish if not explicitly saving as Draft or Archived
      if (userRole && userRole.isApprover && body.status && body.status !== "Draft" && body.status !== "Archived") {
        body.status = "Published";
        body.approvedBy = req.user.id;
        body.approvedByName = req.user.name;
      }

      // If user is Non-Approver and tries to Publish, force it to Pending
      if (userRole && !userRole.isApprover && (body.status === "Published" || body.status === "Complete")) {
        body.status = "Pending";
      }
    }

    // ✅ Set 'Sent By' if status is Pending
    if (body.status === "Pending" && req.user) {
      body.sentBy = req.user.id;
      body.sentByName = req.user.name;
    }

    // ✅ Check for unique Property No within Transaction Type
    await validatePropertyNoUnique(
      body.listingInformation?.listingInformationPropertyNo,
      body.listingInformation?.listingInformationTransactionType
    );

    const newProperty = await CreateProperty.create({
      ...body,
      seoInformation: body.seoInformation || {},
      createdBy: req.user?.id || null,
      createdByName: req.user?.name || "",
    });

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      data: newProperty,
    });
  } catch (error) {
    console.error("❌ CREATE PROPERTY ERROR:", error);
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    if (error.errors) {
      console.error("Validation Errors:", JSON.stringify(error.errors, null, 2));
    }
    // If it's already an ErrorResponse, just rethrow
    if (error instanceof ErrorResponse) throw error;
    // Otherwise wrap it
    throw error;
  }
});

/* =========================================================
   📜 GET ALL PROPERTIES
========================================================= */
exports.getProperties = asyncHandler(async (req, res) => {
  const properties = await CreateProperty.find()
    .populate("createdBy")
    .sort({ createdAt: -1 })
    .allowDiskUse(true);
  res.status(200).json({
    success: true,
    count: properties.length,
    data: properties,
  });
});

/* =========================================================
   🔍 GET SINGLE PROPERTY
========================================================= */
exports.getProperty = asyncHandler(async (req, res) => {
  const property = await CreateProperty.findById(req.params.id).populate(
    "createdBy"
  );

  if (!property) throw new ErrorResponse("Property not found", 404);

  res.status(200).json({
    success: true,
    data: property,
  });
});

/* =========================================================
   ✏️ UPDATE PROPERTY
========================================================= */
exports.updateProperty = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const body = deepNormalizeLocalized(req.body);

  // ✅ Enforce Approval for Updates
  if (req.user && req.user.role) {
    const userRole = await Role.findOne({ name: req.user.role });

    // If user is approver, auto-approve and publish if not explicitly saving as Draft or Archived
    if (userRole && userRole.isApprover && body.status && body.status !== "Draft" && body.status !== "Archived") {
      body.status = "Published";
      body.approvedBy = req.user.id;
      body.approvedByName = req.user.name;
    }

    // Non-approvers cannot set status to Published
    if (userRole && !userRole.isApprover && (body.status === "Published" || body.status === "Complete")) {
      body.status = "Pending";
    }
  }

  // ✅ Set 'Sent By' if status is Pending (Updated by latest editor)
  if (body.status === "Pending" && req.user) {
    body.sentBy = req.user.id;
    body.sentByName = req.user.name;
  }

  // ✅ Check for unique Property No within Transaction Type (Exclude Current)
  await validatePropertyNoUnique(
    body.listingInformation?.listingInformationPropertyNo,
    body.listingInformation?.listingInformationTransactionType,
    id
  );

  const property = await CreateProperty.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true, runValidators: true }
  );

  if (!property)
    throw new ErrorResponse(`Resource not found with id of ${id}`, 404);

  res.status(200).json({
    success: true,
    message: "Property updated successfully",
    data: property,
  });
});

/* =========================================================
   🔍 GET PROPERTY BY PROPERTY ID (e.g. SAL-VN-0001)
========================================================= */
exports.getPropertyByPropertyId = asyncHandler(async (req, res) => {
  const property = await CreateProperty.findOne({
    "listingInformation.listingInformationPropertyId": req.params.propertyId,
  });

  if (!property) throw new ErrorResponse("Property not found", 404);

  res.status(200).json({
    success: true,
    data: property,
  });
});

/* =========================================================
   🗑️ DELETE PROPERTY
========================================================= */
exports.deleteProperty = asyncHandler(async (req, res) => {
  const property = await CreateProperty.findById(req.params.id);
  if (!property) throw new ErrorResponse("Property not found", 404);

  property.status = "Archived";
  await property.save();

  res.status(200).json({
    success: true,
    message: "Property deleted successfully",
  });
});

/* =========================================================
   ❌ HARD DELETE (Permanent Delete)
========================================================= */
exports.permanentlyDeleteProperty = asyncHandler(async (req, res) => {
  const property = await CreateProperty.findById(req.params.id);

  if (!property) throw new ErrorResponse("Property not found", 404);

  await property.deleteOne();

  res.status(200).json({
    success: true,
    message: "Property permanently deleted",
  });
});

/* =========================================================
   🔢 API: Get Next Property ID (Frontend Use)
========================================================= */
exports.getNextPropertyId = asyncHandler(async (req, res) => {
  const transactionType =
    req.query.transactionType?.en || req.query.transactionType;

  if (!transactionType)
    return res.status(400).json({
      success: false,
      message: "transactionType query is required",
    });

  const nextId = await generateNextPropertyId(transactionType);

  res.json({
    success: true,
    nextId,
  });
});

// POST /api/properties/copy/:id
exports.copyPropertyToSale = asyncHandler(async (req, res) => {
  const original = await CreateProperty.findById(req.params.id);
  if (!original) {
    return res
      .status(404)
      .json({ success: false, message: "Property not found" });
  }

  let newData = original.toObject();

  delete newData._id;
  delete newData.createdAt;
  delete newData.updatedAt;

  // Ensure nested objects use localized format
  newData = deepNormalizeLocalized(newData);

  // Set transaction type to Sale
  newData.listingInformation.listingInformationTransactionType = {
    en: "Sale",
    vi: "Mua Bán",
  };

  // Generate next ID
  const nextId = await generateNextPropertyId("Sale");
  newData.listingInformation.listingInformationPropertyId = nextId;

  // ✅ Always save copied properties as Draft
  newData.status = "Draft";

  // ✅ Check for unique Property No in Target Section
  await validatePropertyNoUnique(
    newData.listingInformation?.listingInformationPropertyNo,
    "Sale"
  );

  const newProperty = await CreateProperty.create(newData);

  return res.status(200).json({
    success: true,
    message: "Property copied to Sale",
    data: newProperty,
  });
});

exports.copyPropertyToLease = asyncHandler(async (req, res) => {
  const original = await CreateProperty.findById(req.params.id);
  if (!original)
    return res
      .status(404)
      .json({ success: false, message: "Property not found" });

  let newData = original.toObject();

  delete newData._id;
  delete newData.createdAt;
  delete newData.updatedAt;

  newData = deepNormalizeLocalized(newData);

  newData.listingInformation.listingInformationTransactionType = {
    en: "Lease",
    vi: "Cho Thuê",
  };

  const nextId = await generateNextPropertyId("Lease");
  newData.listingInformation.listingInformationPropertyId = nextId;

  // ✅ Always save copied properties as Draft
  newData.status = "Draft";

  // ✅ Check for unique Property No in Target Section
  await validatePropertyNoUnique(
    newData.listingInformation?.listingInformationPropertyNo,
    "Lease"
  );

  const newProperty = await CreateProperty.create(newData);

  return res.status(200).json({
    success: true,
    message: "Property copied to Lease",
    data: newProperty,
  });
});

exports.copyPropertyToHomeStay = asyncHandler(async (req, res) => {
  const original = await CreateProperty.findById(req.params.id);
  if (!original)
    return res
      .status(404)
      .json({ success: false, message: "Property not found" });

  let newData = original.toObject();

  delete newData._id;
  delete newData.createdAt;
  delete newData.updatedAt;

  newData = deepNormalizeLocalized(newData);

  newData.listingInformation.listingInformationTransactionType = {
    en: "Home Stay",
    vi: "Nhà Trọ",
  };

  const nextId = await generateNextPropertyId("Home Stay");
  newData.listingInformation.listingInformationPropertyId = nextId;

  // ✅ Always save copied properties as Draft
  newData.status = "Draft";

  // ✅ Check for unique Property No in Target Section
  await validatePropertyNoUnique(
    newData.listingInformation?.listingInformationPropertyNo,
    "Home Stay"
  );

  const newProperty = await CreateProperty.create(newData);

  return res.status(200).json({
    success: true,
    message: "Property copied to Home Stay",
    data: newProperty,
  });
});

exports.restoreProperty = asyncHandler(async (req, res) => {
  const property = await CreateProperty.findById(req.params.id);
  if (!property) throw new ErrorResponse("Property not found", 404);

  // ✅ Check for unique Property No before restoring
  await validatePropertyNoUnique(
    property.listingInformation?.listingInformationPropertyNo,
    property.listingInformation?.listingInformationTransactionType,
    property._id
  );

  property.status = "Draft"; // or "Published" if you want
  await property.save();

  res.status(200).json({
    success: true,
    message: "Property restored successfully",
  });
});


// New Endpoints 20/11/2025

exports.getPropertiesByTransactionType = asyncHandler(async (req, res) => {
  let { type, page = 1, limit = 10, trashMode } = req.query;

  if (!type && trashMode !== "true") {
    throw new ErrorResponse("Transaction type (type) is required", 400);
  }

  page = parseInt(page);
  limit = parseInt(limit);

  const skip = (page - 1) * limit;

  // Construct the query
  const query = {};
  const andConditions = [];

  if (type) {
    andConditions.push({
      $or: [
        { "listingInformation.listingInformationTransactionType.en": type },
        { "listingInformation.listingInformationTransactionType.vi": type },
      ],
    });
  }

  // Status Filter
  if (trashMode === "true") {
    query.status = "Archived";
  } else {
    if (req.query.status) {
      query.status = req.query.status;
    } else if (req.query.excludeStatus) {
      query.status = { $ne: req.query.excludeStatus, $nin: ["Archived"] };
    } else {
      query.status = { $ne: "Archived" };
    }
  }

  // --- NEW FILTERS ---
  const { project, zone, block, propertyType, propertyNo, floor, currency, priceFrom, priceTo, keyword } = req.query;

  if (keyword) {
    andConditions.push({
      $or: [
        { "listingInformation.listingInformationPropertyId": { $regex: keyword, $options: "i" } },
        { "listingInformation.listingInformationPropertyNo.en": { $regex: keyword, $options: "i" } },
        { "listingInformation.listingInformationPropertyNo.vi": { $regex: keyword, $options: "i" } },
        { "listingInformation.listingInformationPropertyType.en": { $regex: keyword, $options: "i" } },
        { "listingInformation.listingInformationPropertyType.vi": { $regex: keyword, $options: "i" } },
        { "listingInformation.listingInformationBlockName.en": { $regex: keyword, $options: "i" } },
        { "listingInformation.listingInformationBlockName.vi": { $regex: keyword, $options: "i" } },
        { status: { $regex: keyword, $options: "i" } }
      ],
    });
  }

  if (project) {
    andConditions.push({
      $or: [
        { "listingInformation.listingInformationProjectCommunity.en": { $regex: project, $options: "i" } },
        { "listingInformation.listingInformationProjectCommunity.vi": { $regex: project, $options: "i" } },
      ],
    });
  }

  if (zone) {
    andConditions.push({
      $or: [
        { "listingInformation.listingInformationZoneSubArea.en": { $regex: zone, $options: "i" } },
        { "listingInformation.listingInformationZoneSubArea.vi": { $regex: zone, $options: "i" } },
      ],
    });
  }

  if (block) {
    andConditions.push({
      $or: [
        { "listingInformation.listingInformationBlockName.en": { $regex: block, $options: "i" } },
        { "listingInformation.listingInformationBlockName.vi": { $regex: block, $options: "i" } },
      ],
    });
  }

  if (propertyType) {
    andConditions.push({
      $or: [
        { "listingInformation.listingInformationPropertyType.en": { $regex: propertyType, $options: "i" } },
        { "listingInformation.listingInformationPropertyType.vi": { $regex: propertyType, $options: "i" } },
      ],
    });
  }

  if (propertyNo) {
    andConditions.push({
      $or: [
        { "listingInformation.listingInformationPropertyNo.en": { $regex: propertyNo, $options: "i" } },
        { "listingInformation.listingInformationPropertyNo.vi": { $regex: propertyNo, $options: "i" } },
      ],
    });
  }

  const { owner } = req.query;
  if (owner) {
    andConditions.push({
      $or: [
        { "contactManagement.contactManagementOwner.en": { $regex: owner, $options: "i" } },
        { "contactManagement.contactManagementOwner.vi": { $regex: owner, $options: "i" } },
      ],
    });
  }

  if (floor) {
    andConditions.push({
      $or: [
        { "propertyInformation.informationFloors.en": { $regex: floor, $options: "i" } },
        { "propertyInformation.informationFloors.vi": { $regex: floor, $options: "i" } },
        { "propertyInformation.informationFloors": { $regex: floor, $options: "i" } }, // in case it's a string
      ],
    });
  }

  if (currency) {
    query["financialDetails.financialDetailsCurrency"] = { $regex: currency, $options: "i" };
  }

  // Price Range
  let priceField = "financialDetails.financialDetailsPrice";
  if (type === "Lease" || type === "Cho Thuê") {
    priceField = "financialDetails.financialDetailsLeasePrice";
  } else if (type === "Home Stay" || type === "Nhà Trọ") {
    priceField = "financialDetails.financialDetailsPricePerNight";
  }

  // Helper to clean and parse number strings with commas
  const parsePrice = (val) => {
    if (!val) return undefined;
    const cleanVal = String(val).replace(/,/g, '');
    const num = Number(cleanVal);
    return isNaN(num) ? undefined : num;
  };

  const minP = parsePrice(priceFrom);
  const maxP = parsePrice(priceTo);

  if (minP !== undefined || maxP !== undefined) {
    query[priceField] = {};
    if (minP !== undefined) query[priceField].$gte = minP;
    if (maxP !== undefined) query[priceField].$lte = maxP;
  }

  // Finalize query with $and if conditions exist
  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  // Count AFTER applying correct filters
  const total = await CreateProperty.countDocuments(query);

  // ⚡ PERFORMANCE OPTIMIZATION: Only fetch essential fields for list view
  const properties = await CreateProperty.find(query)
    .select(
      '_id ' +
      'status ' +
      'createdAt ' +
      'createdBy ' +
      'approvedBy ' +
      'createdByName ' +
      'approvedByName ' +
      'sentBy ' +
      'sentByName ' +
      'listingInformation.listingInformationPropertyId ' +
      'listingInformation.listingInformationPropertyNo ' +
      'listingInformation.listingInformationTransactionType ' +
      'listingInformation.listingInformationPropertyType ' +
      'listingInformation.listingInformationBlockName ' +
      'listingInformation.listingInformationProjectCommunity ' +
      'listingInformation.listingInformationZoneSubArea ' +
      'listingInformation.listingInformationAvailabilityStatus ' +
      'financialDetails.financialDetailsCurrency ' +
      'financialDetails.financialDetailsPrice ' +
      'financialDetails.financialDetailsLeasePrice ' +
      'financialDetails.financialDetailsPricePerNight ' +
      'contactManagement.contactManagementOwner ' +
      'contactManagement.contactManagementOwnerPhone ' +
      'seoInformation.slugUrl '
    )
    .populate("createdBy", "name email")
    .populate("approvedBy", "name email")
    .populate("sentBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // 🔄 FALLBACK: If owner phone is missing on property, fetch it from Owner model (Migration support)
  const propertiesToFix = properties.filter(
    (p) =>
      p.contactManagement?.contactManagementOwner &&
      (!p.contactManagement.contactManagementOwnerPhone ||
        p.contactManagement.contactManagementOwnerPhone.length === 0)
  );

  if (propertiesToFix.length > 0) {
    const ownerNames = [];
    propertiesToFix.forEach(p => {
      if (p.contactManagement?.contactManagementOwner?.en) ownerNames.push(p.contactManagement.contactManagementOwner.en);
      if (p.contactManagement?.contactManagementOwner?.vi) ownerNames.push(p.contactManagement.contactManagementOwner.vi);
    });

    const owners = await Owner.find({
      $or: [
        { "ownerName.en": { $in: ownerNames } },
        { "ownerName.vi": { $in: ownerNames } }
      ]
    })
      .select("ownerName phoneNumbers")
      .lean();

    const ownerMap = owners.reduce((acc, o) => {
      if (o.ownerName?.en) acc[o.ownerName.en] = o.phoneNumbers;
      if (o.ownerName?.vi) acc[o.ownerName.vi] = o.phoneNumbers;
      return acc;
    }, {});

    properties.forEach((p) => {
      if (
        p.contactManagement?.contactManagementOwner &&
        (!p.contactManagement.contactManagementOwnerPhone ||
          p.contactManagement.contactManagementOwnerPhone.length === 0)
      ) {
        const nameEn = p.contactManagement.contactManagementOwner.en;
        const nameVi = p.contactManagement.contactManagementOwner.vi;
        if (nameEn && ownerMap[nameEn]) {
          p.contactManagement.contactManagementOwnerPhone = ownerMap[nameEn];
        } else if (nameVi && ownerMap[nameVi]) {
          p.contactManagement.contactManagementOwnerPhone = ownerMap[nameVi];
        }
      }
    });
  }

  // �🔍 Debug: Verify optimization is working
  console.log('📊 Properties fetched:', properties.length);
  if (properties.length > 0) {
    console.log('✅ First property has imagesVideos?', 'imagesVideos' in properties[0]);
    console.log('📦 First property keys:', Object.keys(properties[0]).join(', '));
  }

  // 🚫 Prevent browser caching to ensure fresh data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  return res.status(200).json({
    success: true,
    page,
    limit,
    total,                  // now correct
    totalPages: Math.ceil(total / limit),
    count: properties.length,
    data: properties,
  });
});

exports.getTrashProperties = asyncHandler(async (req, res) => {
  let { type, page = 1, limit = 10, search = "" } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  const skip = (page - 1) * limit;

  // base filter → TRASH ONLY
  const filter = {
    status: "Archived",
  };

  // optional transaction type filter (Sale / Lease / Home Stay)
  if (type) {
    filter.$or = [
      { "listingInformation.listingInformationTransactionType.en": type },
      { "listingInformation.listingInformationTransactionType.vi": type },
    ];
  }

  // optional search filter
  if (search) {
    filter.$or = [
      { "listingInformation.listingInformationPropertyId": { $regex: search, $options: "i" } },
      { "listingInformation.listingInformationPropertyNo.en": { $regex: search, $options: "i" } },
      { "listingInformation.listingInformationPropertyNo.vi": { $regex: search, $options: "i" } },
      { "listingInformation.listingInformationPropertyType.en": { $regex: search, $options: "i" } },
      { "listingInformation.listingInformationPropertyType.vi": { $regex: search, $options: "i" } },
      { "listingInformation.listingInformationBlockName.en": { $regex: search, $options: "i" } },
      { "listingInformation.listingInformationBlockName.vi": { $regex: search, $options: "i" } },
    ];
  }

  const total = await CreateProperty.countDocuments(filter);

  const properties = await CreateProperty.find(filter)
    .select(
      '_id ' +
      'status ' +
      'createdAt ' +
      'listingInformation.listingInformationPropertyId ' +
      'listingInformation.listingInformationPropertyNo ' +
      'listingInformation.listingInformationTransactionType ' +
      'listingInformation.listingInformationPropertyType ' +
      'listingInformation.listingInformationBlockName ' +
      'listingInformation.listingInformationProjectCommunity ' +
      'listingInformation.listingInformationZoneSubArea ' +
      'listingInformation.listingInformationAvailabilityStatus ' +
      'financialDetails.financialDetailsCurrency ' +
      'financialDetails.financialDetailsPrice ' +
      'financialDetails.financialDetailsLeasePrice ' +
      'financialDetails.financialDetailsPricePerNight ' +
      'contactManagement.contactManagementOwner ' +
      'contactManagement.contactManagementOwnerPhone ' +
      'seoInformation.slugUrl '
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(200).json({
    success: true,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    count: properties.length,
    data: properties,
  });
});

/* =========================================================
   🏠 OPTIMIZED LISTING PAGE API WITH FILTERS
========================================================= */
exports.getListingProperties = asyncHandler(async (req, res) => {
  let {
    type,              // Transaction type: Sale / Lease / Home Stay
    page = 1,
    limit = 10,
    // New comprehensive filters
    propertyId = "",   // Property ID search
    keyword = "",      // Keyword search
    projectId = "",    // Project/Community ID
    zoneId = "",       // Area/Zone ID
    blockId = "",      // Block Name ID
    propertyType = "", // Property Type
    bedrooms = "",     // Number of bedrooms
    bathrooms = "",    // Number of bathrooms
    currency = "",     // Currency filter
    minPrice = "",     // Minimum price
    maxPrice = "",     // Maximum price
    owner = "",        // Owner name filter
    status = "",       // Status filter (overrides default "Published")
    sortBy = "newest"  // Sort: newest, oldest, price-low, price-high
  } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  // Base filter - default to Published if no status provided
  const matchStage = {};
  if (status === "all") {
    matchStage.status = { $ne: "Archived" };
  } else if (status) {
    matchStage.status = status;
  } else {
    matchStage.status = "Published";
  }

  // Transaction type filter (required)
  if (type) {
    matchStage.$or = [
      { "listingInformation.listingInformationTransactionType.en": type },
      { "listingInformation.listingInformationTransactionType.vi": type },
    ];
  }

  // Property ID filter (exact match)
  if (propertyId) {
    matchStage["listingInformation.listingInformationPropertyId"] = { $regex: propertyId, $options: "i" };
  }

  // Keyword search (search in multiple fields)
  if (keyword) {
    matchStage.$and = matchStage.$and || [];
    matchStage.$and.push({
      $or: [
        { "listingInformation.listingInformationPropertyId": { $regex: keyword, $options: "i" } },
        { "listingInformation.listingInformationPropertyTitle.en": { $regex: keyword, $options: "i" } },
        { "listingInformation.listingInformationPropertyTitle.vi": { $regex: keyword, $options: "i" } },
        { "listingInformation.listingInformationBlockName.en": { $regex: keyword, $options: "i" } },
        { "listingInformation.listingInformationBlockName.vi": { $regex: keyword, $options: "i" } },
        { "listingInformation.listingInformationProjectCommunity.en": { $regex: keyword, $options: "i" } },
        { "listingInformation.listingInformationProjectCommunity.vi": { $regex: keyword, $options: "i" } },
        { "listingInformation.listingInformationZoneSubArea.en": { $regex: keyword, $options: "i" } },
        { "listingInformation.listingInformationZoneSubArea.vi": { $regex: keyword, $options: "i" } },
      ]
    });
  }

  // Project/Community filter (ID match)
  if (projectId) {
    matchStage.$and = matchStage.$and || [];
    matchStage.$and.push({
      $or: [
        { "listingInformation.listingInformationProjectCommunity.en": { $regex: projectId, $options: "i" } },
        { "listingInformation.listingInformationProjectCommunity.vi": { $regex: projectId, $options: "i" } },
      ]
    });
  }

  // Area/Zone filter (ID match)
  if (zoneId) {
    matchStage.$and = matchStage.$and || [];
    matchStage.$and.push({
      $or: [
        { "listingInformation.listingInformationZoneSubArea.en": { $regex: zoneId, $options: "i" } },
        { "listingInformation.listingInformationZoneSubArea.vi": { $regex: zoneId, $options: "i" } },
      ]
    });
  }

  // Block Name filter (ID match)
  if (blockId) {
    matchStage.$and = matchStage.$and || [];
    matchStage.$and.push({
      $or: [
        { "listingInformation.listingInformationBlockName.en": { $regex: blockId, $options: "i" } },
        { "listingInformation.listingInformationBlockName.vi": { $regex: blockId, $options: "i" } },
      ]
    });
  }

  // Property type filter
  if (propertyType) {
    matchStage.$and = matchStage.$and || [];
    matchStage.$and.push({
      $or: [
        { "listingInformation.listingInformationPropertyType.en": { $regex: propertyType, $options: "i" } },
        { "listingInformation.listingInformationPropertyType.vi": { $regex: propertyType, $options: "i" } },
      ]
    });
  }

  // Bedrooms filter
  if (bedrooms) {
    const bedroomCount = parseInt(bedrooms);
    if (bedroomCount === 4) {
      // 4+ bedrooms
      matchStage["propertyInformation.informationBedrooms"] = { $gte: 4 };
    } else {
      matchStage["propertyInformation.informationBedrooms"] = bedroomCount;
    }
  }

  // Bathrooms filter
  if (bathrooms) {
    const bathroomCount = parseInt(bathrooms);
    if (bathroomCount === 3) {
      // 3+ bathrooms
      matchStage["propertyInformation.informationBathrooms"] = { $gte: 3 };
    } else {
      matchStage["propertyInformation.informationBathrooms"] = bathroomCount;
    }
  }

  // Currency filter
  if (currency) {
    matchStage["financialDetails.financialDetailsCurrency"] = currency;
  }

  // Determine price field based on transaction type
  let filterPriceField = "financialDetails.financialDetailsPrice";
  if (type === 'Lease') {
    filterPriceField = "financialDetails.financialDetailsLeasePrice";
  } else if (type === 'Home Stay') {
    filterPriceField = "financialDetails.financialDetailsPricePerNight";
  }

  // Price range filter
  if (minPrice || maxPrice) {
    matchStage[filterPriceField] = {};
    if (minPrice) {
      matchStage[filterPriceField].$gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      matchStage[filterPriceField].$lte = parseFloat(maxPrice);
    }
  }

  // Owner filter
  if (owner) {
    matchStage.$and = matchStage.$and || [];
    matchStage.$and.push({
      $or: [
        { "contactManagement.contactManagementOwner.en": { $regex: owner, $options: "i" } },
        { "contactManagement.contactManagementOwner.vi": { $regex: owner, $options: "i" } },
      ]
    });
  }

  // Remove old Size range filter
  // if (minSize || maxSize) {
  //   matchStage["propertyInformation.informationUnitSize"] = {};
  //   if (minSize) {
  //     matchStage["propertyInformation.informationUnitSize"].$gte = parseFloat(minSize);
  //   }
  //   if (maxSize) {
  //     matchStage["propertyInformation.informationUnitSize"].$lte = parseFloat(maxSize);
  //   }
  // }

  // Sorting - Handle different price fields based on transaction type
  let sortStage = { createdAt: -1 }; // Default: newest first

  // Determine which price field to use based on transaction type
  let priceField = "financialDetails.financialDetailsPrice";
  if (type === 'Lease') {
    priceField = "financialDetails.financialDetailsLeasePrice";
  } else if (type === 'Home Stay') {
    priceField = "financialDetails.financialDetailsPricePerNight";
  }

  switch (sortBy) {
    case 'newest':
      sortStage = { createdAt: -1 };
      break;
    case 'oldest':
      sortStage = { createdAt: 1 };
      break;
    case 'price-low':
      sortStage = { [priceField]: 1 };
      break;
    case 'price-high':
      sortStage = { [priceField]: -1 };
      break;
    case 'default':
    default:
      sortStage = { createdAt: -1 };
  }

  // ⚡ USE AGGREGATION PIPELINE FOR MAXIMUM PERFORMANCE
  // This slices the images array at the database level, not in Node.js
  const aggregationPipeline = [
    // Stage 1: Match/Filter
    { $match: matchStage },

    // Stage 2: Sort
    { $sort: sortStage },

    // Stage 3: Project (Optimization: Reduce document size BEFORE facet)
    {
      $project: {
        _id: 1,
        status: 1,
        createdAt: 1,
        // Listing Information
        'listingInformation.listingInformationPropertyId': 1,
        'listingInformation.listingInformationTransactionType': 1,
        'listingInformation.listingInformationPropertyType': 1,
        'listingInformation.listingInformationPropertyTitle': 1,
        'listingInformation.listingInformationBlockName': 1,
        'listingInformation.listingInformationProjectCommunity': 1,
        'listingInformation.listingInformationZoneSubArea': 1,
        'listingInformation.listingInformationAvailabilityStatus': 1,
        'listingInformation.listingInformationDateListed': 1,
        'listingInformation.listingInformationAvailableFrom': 1,
        'listingInformation.listingInformationPropertyNo': 1,
        // Financial Details
        'financialDetails.financialDetailsCurrency': 1,
        'financialDetails.financialDetailsPrice': 1,
        'financialDetails.financialDetailsLeasePrice': 1,
        'financialDetails.financialDetailsPricePerNight': 1,
        // Property Information
        'propertyInformation.informationBedrooms': 1,
        'propertyInformation.informationBathrooms': 1,
        'propertyInformation.informationUnitSize': 1,
        'propertyInformation.informationUnit': 1,
        'propertyInformation.informationFloors': 1,
        'propertyInformation.informationFurnishing': 1,
        'propertyInformation.informationView': 1,
        // Contact Management
        'contactManagement.contactManagementOwner': 1,
        'contactManagement.contactManagementOwnerPhone': 1,
        // Description
        'whatNearby.whatNearbyDescription': 1,
        // ⚡ CRITICAL: Only get first image at DB level
        'imagesVideos.propertyImages': { $slice: ['$imagesVideos.propertyImages', 1] },
        // SEO Info for URL Construction
        'seoInformation.slugUrl': 1
      }
    },

    // Stage 4: Facet for count and data
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: limit }
        ]
      }
    }
  ];

  const result = await CreateProperty.aggregate(aggregationPipeline).allowDiskUse(true);

  const total = result[0]?.metadata[0]?.total || 0;
  const properties = result[0]?.data || [];

  // 🔄 FALLBACK: If owner phone is missing on property, fetch it from Owner model (Migration support)
  const propertiesToFix = properties.filter(
    (p) =>
      p.contactManagement?.contactManagementOwner &&
      (!p.contactManagement.contactManagementOwnerPhone ||
        p.contactManagement.contactManagementOwnerPhone.length === 0)
  );

  if (propertiesToFix.length > 0) {
    const ownerNames = [];
    propertiesToFix.forEach(p => {
      if (p.contactManagement.contactManagementOwner.en) ownerNames.push(p.contactManagement.contactManagementOwner.en);
      if (p.contactManagement.contactManagementOwner.vi) ownerNames.push(p.contactManagement.contactManagementOwner.vi);
    });

    const owners = await Owner.find({
      $or: [
        { "ownerName.en": { $in: ownerNames } },
        { "ownerName.vi": { $in: ownerNames } }
      ]
    })
      .select("ownerName phoneNumbers")
      .lean();

    const ownerMap = owners.reduce((acc, o) => {
      if (o.ownerName?.en) acc[o.ownerName.en] = o.phoneNumbers;
      if (o.ownerName?.vi) acc[o.ownerName.vi] = o.phoneNumbers;
      return acc;
    }, {});

    properties.forEach((p) => {
      if (
        p.contactManagement?.contactManagementOwner &&
        (!p.contactManagement.contactManagementOwnerPhone ||
          p.contactManagement.contactManagementOwnerPhone.length === 0)
      ) {
        const nameEn = p.contactManagement.contactManagementOwner.en;
        const nameVi = p.contactManagement.contactManagementOwner.vi;
        if (nameEn && ownerMap[nameEn]) {
          p.contactManagement.contactManagementOwnerPhone = ownerMap[nameEn];
        } else if (nameVi && ownerMap[nameVi]) {
          p.contactManagement.contactManagementOwnerPhone = ownerMap[nameVi];
        }
      }
    });
  }

  // Log performance metrics
  if (properties.length > 0) {
    const firstProp = properties[0];
    const imageCount = firstProp.imagesVideos?.propertyImages?.length || 0;
  }

  // Prevent browser caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  return res.status(200).json({
    success: true,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    count: properties.length,
    data: properties,
  });
});

/* =========================================================
   🔍 VALIDATE PROPERTY NO
========================================================= */
exports.validatePropertyNo = asyncHandler(async (req, res) => {
  const { propertyNo, transactionType, excludeId } = req.body;

  if (!propertyNo || (!propertyNo.en && !propertyNo.vi)) {
    return res.status(200).json({ success: true, message: "Property No is empty" });
  }

  if (!transactionType) {
    throw new ErrorResponse("Transaction type is required", 400);
  }

  await validatePropertyNoUnique(propertyNo, transactionType, excludeId);

  res.status(200).json({
    success: true,
    message: "Property No is available",
  });
});
