const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const CreateProperty = require("../models/CreateProperty");
const shortid = require("shortid");

/* =========================================================
   🏠 CREATE PROPERTY
========================================================= */
exports.createProperty = asyncHandler(async (req, res) => {
  const body = req.body || {};

  // Auto-generate Property ID if not provided
  if (!body.propertyId) {
    body.propertyId = `P${shortid.generate()}`;
  }

  // Helper: wrap multilingual strings
  const ensureLocalized = (val) => {
    if (!val) return { en: "", vi: "" };
    if (typeof val === "string") return { en: val, vi: val };
    return val;
  };

  // Base payload
  const payload = {
    ...body,
    project: ensureLocalized(body.project),
    title: ensureLocalized(body.title),
    address: ensureLocalized(body.address),
    description: ensureLocalized(body.description),
    contractTerms: ensureLocalized(body.contractTerms),
    depositPaymentTerms: ensureLocalized(body.depositPaymentTerms),
    view: ensureLocalized(body.view),
  };

  /* ✅ AUTO-FIX COMMON TYPE ISSUES */
  if (payload.yearBuilt && typeof payload.yearBuilt === "string") {
    const year = parseInt(payload.yearBuilt.split("-")[0], 10);
    payload.yearBuilt = isNaN(year) ? null : year;
  }

  if (payload.whatsNearby && typeof payload.whatsNearby === "string") {
    payload.whatsNearby = [
      {
        name: { en: payload.whatsNearby, vi: payload.whatsNearby },
        distanceKM: 0,
      },
    ];
  }

  if (Array.isArray(payload.amenities)) {
    payload.whatsNearby = payload.amenities.map((a) => ({
      name: { en: a.name || "", vi: a.name || "" },
      distanceKM: Number(a.km || 0),
    }));
  }

  // Convert numeric string fields safely
  const numericFields = [
    "unitSize",
    "bedrooms",
    "bathrooms",
    "floors",
    "floorNumber",
    "price",
    "pricePerUnit",
    "maintenanceFeeMonthly",
  ];
  numericFields.forEach((field) => {
    if (payload[field] && typeof payload[field] === "string") {
      const num = parseFloat(payload[field]);
      payload[field] = isNaN(num) ? 0 : num;
    }
  });

  payload.createdBy = req.user?.id || null;

  const newProperty = await CreateProperty.create(payload);

  res.status(201).json({
    success: true,
    message: "Property created successfully",
    data: newProperty,
  });
});

/* =========================================================
   📜 GET ALL PROPERTIES
========================================================= */
exports.getProperties = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    transactionType,
    city,
    status,
    sortBy = "-createdAt",
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const filter = {};
  if (transactionType) filter.transactionType = transactionType;
  if (city) filter.city = city;
  if (status) filter.status = status;

  if (search) {
    filter.$or = [
      { "title.en": { $regex: search, $options: "i" } },
      { "title.vi": { $regex: search, $options: "i" } },
      { "description.en": { $regex: search, $options: "i" } },
      { "description.vi": { $regex: search, $options: "i" } },
      { propertyId: { $regex: search, $options: "i" } },
    ];
  }

  const [total, properties] = await Promise.all([
    CreateProperty.countDocuments(filter),
    CreateProperty.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit))
      .populate(
        "propertyType availabilityStatus furnishing parkingAvailability petPolicy createdBy"
      ),
  ]);

  res.status(200).json({
    success: true,
    count: properties.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    data: properties,
  });
});

/* =========================================================
   🔍 GET SINGLE PROPERTY
========================================================= */
exports.getProperty = asyncHandler(async (req, res) => {
  const property = await CreateProperty.findById(req.params.id).populate(
    "propertyType availabilityStatus furnishing parkingAvailability petPolicy createdBy"
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
  const property = await CreateProperty.findById(req.params.id);
  if (!property) throw new ErrorResponse("Property not found", 404);

  const payload = req.body || {};

  // Localized merge helper
  const mergeLocalized = (targetField, newVal) => {
    if (!newVal) return;
    if (typeof newVal === "string")
      property[targetField] = {
        en: newVal,
        vi: property[targetField]?.vi || "",
      };
    else property[targetField] = { ...property[targetField], ...newVal };
  };

  const localizedKeys = [
    "project",
    "title",
    "address",
    "description",
    "contractTerms",
    "depositPaymentTerms",
    "view",
  ];
  localizedKeys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(payload, key))
      mergeLocalized(key, payload[key]);
  });

  // Normalize yearBuilt
  if (payload.yearBuilt && typeof payload.yearBuilt === "string") {
    const year = parseInt(payload.yearBuilt.split("-")[0], 10);
    property.yearBuilt = isNaN(year) ? null : year;
  }

  // Normalize whatsNearby
  if (payload.whatsNearby && typeof payload.whatsNearby === "string") {
    property.whatsNearby = [
      {
        name: { en: payload.whatsNearby, vi: payload.whatsNearby },
        distanceKM: 0,
      },
    ];
  }

  if (Array.isArray(payload.amenities)) {
    property.whatsNearby = payload.amenities.map((a) => ({
      name: { en: a.name || "", vi: a.name || "" },
      distanceKM: Number(a.km || 0),
    }));
  }

  // Convert safe numeric fields
  const numericFields = [
    "unitSize",
    "bedrooms",
    "bathrooms",
    "floors",
    "floorNumber",
    "price",
    "pricePerUnit",
    "maintenanceFeeMonthly",
  ];
  numericFields.forEach((key) => {
    if (payload[key] && typeof payload[key] === "string") {
      const num = parseFloat(payload[key]);
      property[key] = isNaN(num) ? 0 : num;
    } else if (payload[key] != null) {
      property[key] = payload[key];
    }
  });

  // Copy remaining non-localized fields
  const simpleKeys = [
    "transactionType",
    "propertyType",
    "country",
    "state",
    "city",
    "postalCode",
    "dateListed",
    "availabilityStatus",
    "availableFrom",
    "unit",
    "furnishing",
    "parkingAvailability",
    "petPolicy",
    "utilities",
    "propertyImages",
    "propertyVideos",
    "floorPlans",
    "currency",
    "owners",
    "propertyConsultant",
    "internalNotes",
    "status",
  ];

  simpleKeys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      property[key] = payload[key];
    }
  });

  await property.save();

  res.status(200).json({
    success: true,
    message: "Property updated successfully",
    data: property,
  });
});

/* =========================================================
   🗑️ DELETE PROPERTY
========================================================= */
exports.deleteProperty = asyncHandler(async (req, res) => {
  const property = await CreateProperty.findById(req.params.id);
  if (!property) throw new ErrorResponse("Property not found", 404);

  await property.deleteOne();

  res.status(200).json({
    success: true,
    message: "Property deleted successfully",
  });
});
