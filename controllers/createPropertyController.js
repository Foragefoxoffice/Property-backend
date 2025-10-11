const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const CreateProperty = require("../models/CreateProperty");

/* =========================================================
   🔢 Generate Sequential Property ID
========================================================= */
async function generateNextPropertyId() {
  const lastProperty = await CreateProperty.findOne({})
    .sort({ createdAt: -1 })
    .select("listingInformation.listingInformationPropertyId");

  if (!lastProperty) return "P1001";
  const lastId = lastProperty.listingInformation?.listingInformationPropertyId || "";
  const numericPart = parseInt(lastId.replace(/\D/g, ""), 10) || 1000;
  return `P${numericPart + 1}`;
}

/* =========================================================
   🧰 Helpers
========================================================= */
function normalizeLocalized(obj) {
  if (!obj || typeof obj !== "object") return { en: "", vi: "" };
  if (typeof obj === "string") return { en: obj, vi: obj };
  return { en: obj.en || "", vi: obj.vi || "" };
}

function deepNormalizeLocalized(data) {
  if (!data || typeof data !== "object") return data;
  for (const key in data) {
    if (!Object.hasOwn(data, key)) continue;
    const val = data[key];
    if (val && typeof val === "object" && ("en" in val || "vi" in val)) {
      data[key] = normalizeLocalized(val);
    } else if (typeof val === "object" && !Array.isArray(val)) {
      deepNormalizeLocalized(val);
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

  // 🔹 Always generate a unique Property ID
  let propertyId =
    body.listingInformation.listingInformationPropertyId ||
    (await generateNextPropertyId());

  // 🔍 Ensure no duplicate exists
  const exists = await CreateProperty.findOne({
    "listingInformation.listingInformationPropertyId": propertyId,
  });
  if (exists) propertyId = await generateNextPropertyId();

  body.listingInformation.listingInformationPropertyId = propertyId;

  // 🔹 Create document
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
  const property = await CreateProperty.findById(req.params.id);
  if (!property) throw new ErrorResponse("Property not found", 404);

  Object.assign(property, deepNormalizeLocalized(req.body));
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
