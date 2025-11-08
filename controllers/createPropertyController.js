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
   🔢 Generate Next Property ID (PHS001 → PHS002)
========================================================= */
async function generateNextPropertyId() {
  const lastProperty = await CreateProperty.findOne({
    "listingInformation.listingInformationPropertyId": { $regex: /^PHS\d+$/ },
  })
    .sort({ createdAt: -1 })
    .select("listingInformation.listingInformationPropertyId")
    .lean();

  let nextId = "PHS001";

  if (lastProperty) {
    const lastId = lastProperty.listingInformation.listingInformationPropertyId;
    const num = parseInt(lastId.replace("PHS", ""), 10);
    nextId = `PHS${String(num + 1).padStart(3, "0")}`;
  }

  return nextId;
}

/* =========================================================
   🏠 CREATE PROPERTY
========================================================= */
exports.createProperty = asyncHandler(async (req, res) => {
  const body = deepNormalizeLocalized(req.body || {});

  if (!body.listingInformation) body.listingInformation = {};

  /* ✅ Always generate next ID from DB */
  const propertyId = await generateNextPropertyId();

  body.listingInformation.listingInformationPropertyId = propertyId;

  /* ✅ Ensure Property No is normalized */
  if (body.listingInformation.listingInformationPropertyNo) {
    body.listingInformation.listingInformationPropertyNo = normalizeLocalized(
      body.listingInformation.listingInformationPropertyNo
    );
  } else {
    body.listingInformation.listingInformationPropertyNo = { en: "", vi: "" };
  }

  /* =========================================================
     ✅ Create Document
  ========================================================== */
  const newProperty = await CreateProperty.create({
    ...body,
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

/* =========================================================
   🔢 API: Get Next Property ID
========================================================= */
exports.getNextPropertyId = asyncHandler(async (req, res) => {
  const nextId = await generateNextPropertyId();

  res.json({
    success: true,
    nextId,
  });
});
