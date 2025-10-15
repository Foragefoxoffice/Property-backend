const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const CreateProperty = require("../models/CreateProperty");
const ZoneSubArea = require("../models/ZoneSubArea");
const mongoose = require("mongoose");

/* =========================================================
   🔢 Generate Sequential Property ID
========================================================= */
async function generateNextPropertyId() {
  const lastProperty = await CreateProperty.findOne({})
    .sort({ createdAt: -1 })
    .select("listingInformation.listingInformationPropertyId");

  if (!lastProperty) return "P1001";
  const lastId =
    lastProperty.listingInformation?.listingInformationPropertyId || "";
  const numericPart = parseInt(lastId.replace(/\D/g, ""), 10) || 1000;
  return `P${numericPart + 1}`;
}

/* =========================================================
   🧰 Helpers
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

    // Handle localized field objects
    if (val && typeof val === "object" && ("en" in val || "vi" in val)) {
      data[key] = normalizeLocalized(val);
    }
    // Recurse deeper for nested objects
    else if (typeof val === "object" && !Array.isArray(val)) {
      data[key] = deepNormalizeLocalized(val);
    }
  }
  return data;
}

/* =========================================================
   🏠 CREATE PROPERTY
========================================================= */
exports.createProperty = asyncHandler(async (req, res) => {
  const body = deepNormalizeLocalized(req.body || {});

  if (!body.listingInformation) body.listingInformation = {};

  /* =========================================================
     1️⃣ Generate a Unique Property ID
  ========================================================== */
  let propertyId =
    body.listingInformation.listingInformationPropertyId ||
    (await generateNextPropertyId());

  const exists = await CreateProperty.findOne({
    "listingInformation.listingInformationPropertyId": propertyId,
  });

  if (exists) propertyId = await generateNextPropertyId();

  body.listingInformation.listingInformationPropertyId = propertyId;

  /* =========================================================
     2️⃣ Ensure Property No is normalized (Fix)
  ========================================================== */
  if (body.listingInformation.listingInformationPropertyNo) {
    body.listingInformation.listingInformationPropertyNo = normalizeLocalized(
      body.listingInformation.listingInformationPropertyNo
    );
  } else {
    body.listingInformation.listingInformationPropertyNo = { en: "", vi: "" };
  }

  /* =========================================================
     3️⃣ Handle Area / Zone (type or select)
  ========================================================== */
  if (body.listingInformation.listingInformationZoneSubArea) {
    const val = body.listingInformation.listingInformationZoneSubArea;

    // If user typed text instead of selecting ID
    if (!mongoose.Types.ObjectId.isValid(val)) {
      // Check if zone exists
      const existingZone = await ZoneSubArea.findOne({
        $or: [{ "name.en": val }, { "name.vi": val }],
      });

      let zoneDoc = existingZone;
      if (!zoneDoc) {
        // Auto-create zone
        zoneDoc = await ZoneSubArea.create({
          name: { en: val, vi: val },
          code: {
            en: val.slice(0, 3).toUpperCase(),
            vi: val.slice(0, 3).toUpperCase(),
          },
          status: "Active",
        });
      }

      body.listingInformation.listingInformationZoneSubArea = zoneDoc._id;
    }
  }

  /* =========================================================
     4️⃣ Create Property Document
  ========================================================== */
  const newProperty = await CreateProperty.create({
    ...body,
    createdBy: req.user?.id || null,
  });

  /* =========================================================
     5️⃣ Send Response
  ========================================================== */
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
  const property = await CreateProperty.findById(req.params.id);
  if (!property) throw new ErrorResponse("Property not found", 404);

  const body = deepNormalizeLocalized(req.body || {});
  if (body.listingInformation?.listingInformationPropertyNo) {
    body.listingInformation.listingInformationPropertyNo = normalizeLocalized(
      body.listingInformation.listingInformationPropertyNo
    );
  }

  Object.assign(property, body);
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
