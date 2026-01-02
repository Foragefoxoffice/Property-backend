const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const CreateProperty = require("../models/CreateProperty");
const ZoneSubArea = require("../models/ZoneSubArea");
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
    Sale: "SAL-VN-",
    Lease: "LSE-VN-",
    "Home Stay": "HST-VN-",
  };

  const prefix = prefixes[transactionType] || "UNK-VN-";

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

    const newProperty = await CreateProperty.create({
      ...body,
      seoInformation: body.seoInformation || {},
      createdBy: req.user?.id || null,
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

  if (!type) {
    throw new ErrorResponse("Transaction type (type) is required", 400);
  }

  page = parseInt(page);
  limit = parseInt(limit);

  const skip = (page - 1) * limit;

  // base filter for filtering by type
  const filter = {
    $or: [
      { "listingInformation.listingInformationTransactionType.en": type },
      { "listingInformation.listingInformationTransactionType.vi": type },
    ],
  };

  // ⭐ ADD STATUS FILTER (important!)
  if (trashMode === "true") {
    filter.status = "Archived";         // only archived items
  } else {
    filter.status = { $ne: "Archived" }; // all except archived
  }

  // Count AFTER applying correct filters
  const total = await CreateProperty.countDocuments(filter);

  // ⚡ PERFORMANCE OPTIMIZATION: Only fetch essential fields for list view
  // Exclude: images, videos, descriptions, SEO data, and other heavy fields
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
      'financialDetails.financialDetailsPrice '
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // 🔍 Debug: Verify optimization is working
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
      'financialDetails.financialDetailsPrice '
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
    sortBy = "newest"  // Sort: newest, oldest, price-low, price-high
  } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  // Base filter - exclude archived and draft properties (only show published)
  const matchStage = {
    status: { $nin: ["Archived", "Draft"] }
  };

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

  // Price range filter
  if (minPrice || maxPrice) {
    matchStage["financialDetails.financialDetailsPrice"] = {};
    if (minPrice) {
      matchStage["financialDetails.financialDetailsPrice"].$gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      matchStage["financialDetails.financialDetailsPrice"].$lte = parseFloat(maxPrice);
    }
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

  console.log(`🔄 Sorting by: ${sortBy}, Sort Stage:`, sortStage);

  // ⚡ USE AGGREGATION PIPELINE FOR MAXIMUM PERFORMANCE
  // This slices the images array at the database level, not in Node.js
  const aggregationPipeline = [
    // Stage 1: Match/Filter
    { $match: matchStage },

    // Stage 2: Sort
    { $sort: sortStage },

    // Stage 3: Facet for count and data
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: limit },
          // Stage 4: Project only needed fields and slice images
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
              // Description
              'whatNearby.whatNearbyDescription': 1,
              // ⚡ CRITICAL: Only get first image at DB level
              'imagesVideos.propertyImages': { $slice: ['$imagesVideos.propertyImages', 1] }
            }
          }
        ]
      }
    }
  ];

  console.time('⚡ Listing Query Time');
  const result = await CreateProperty.aggregate(aggregationPipeline).allowDiskUse(true);
  console.timeEnd('⚡ Listing Query Time');

  const total = result[0]?.metadata[0]?.total || 0;
  const properties = result[0]?.data || [];

  // Log performance metrics
  console.log(`📊 Fetched ${properties.length} properties (Page ${page}/${Math.ceil(total / limit)})`);
  if (properties.length > 0) {
    const firstProp = properties[0];
    const imageCount = firstProp.imagesVideos?.propertyImages?.length || 0;
    console.log(`✅ Images per property: ${imageCount} (optimized)`);
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
