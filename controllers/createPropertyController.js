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

  for (const key in data) {
    if (!Object.hasOwn(data, key)) continue;
    const val = data[key];

    if (key === "metaKeywords" && typeof val === "object") {
      data[key] = {
        en: Array.isArray(val.en) ? val.en : [],
        vi: Array.isArray(val.vi) ? val.vi : [],
      };
      continue;
    }

    if (val && typeof val === "object" && ("en" in val || "vi" in val)) {
      data[key] = normalizeLocalized(val);
    } else if (typeof val === "object" && !Array.isArray(val)) {
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
    "Sale": "SAL-VN-",
    "Lease": "LSE-VN-",
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
  const body = deepNormalizeLocalized(req.body || {});

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
});


/* =========================================================
   📜 GET ALL PROPERTIES
========================================================= */
exports.getProperties = asyncHandler(async (req, res) => {
  const properties = await CreateProperty.find()
    .populate(
      "listingInformation.listingInformationPropertyType listingInformation.listingInformationAvailabilityStatus propertyInformation.informationFurnishing createdBy"
    )
    .sort({ createdAt: -1 });

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
    "listingInformation.listingInformationPropertyType listingInformation.listingInformationAvailabilityStatus propertyInformation.informationFurnishing createdBy"
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
  const property = await CreateProperty.findById(id);

  if (!property)
    throw new ErrorResponse(`Resource not found with id of ${id}`, 404);

  Object.assign(property, req.body);

  if (req.body.seoInformation) {
    property.seoInformation = {
      ...property.seoInformation.toObject(),
      ...req.body.seoInformation,
    };
  }
  await property.save();

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
  const transactionType = req.query.transactionType?.en || req.query.transactionType;

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
