const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const CreateProperty = require("../models/CreateProperty");
const Property = require("../models/Property");
const ZoneSubArea = require("../models/ZoneSubArea");
const PropertyType = require("../models/PropertyType");
const Block = require("../models/Block");
const Currency = require("../models/Currency");
const Furnishing = require("../models/Furnishing");
const FloorRange = require("../models/FloorRange");
const Unit = require("../models/Unit");
const Papa = require("papaparse");

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
   🧰 Helper: Normalize Localized Fields
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

/* =========================================================
   🔍 Validate Master Fields
========================================================= */
async function validateMasterFields(row, transactionType) {
  const errors = [];

  // Validate Project / Community
  if (row["Project / Community"]) {
    const project = await Property.findOne({
      $or: [
        { "name.en": { $regex: new RegExp(`^${row["Project / Community"]}$`, "i") } },
        { "name.vi": { $regex: new RegExp(`^${row["Project / Community"]}$`, "i") } },
      ],
    });
    if (!project) {
      errors.push({
        field: "Project / Community",
        message: `Project/Community "${row["Project / Community"]}" not found in master data`,
      });
    }
  }

  // Validate Area / Zone
  if (row["Area / Zone"]) {
    const zone = await ZoneSubArea.findOne({
      $or: [
        { "name.en": { $regex: new RegExp(`^${row["Area / Zone"]}$`, "i") } },
        { "name.vi": { $regex: new RegExp(`^${row["Area / Zone"]}$`, "i") } },
      ],
    });
    if (!zone) {
      errors.push({
        field: "Area / Zone",
        message: `Area/Zone "${row["Area / Zone"]}" not found in master data`,
      });
    }
  }

  // Validate Block Name
  if (row["Block Name"]) {
    const block = await Block.findOne({
      $or: [
        { "name.en": { $regex: new RegExp(`^${row["Block Name"]}$`, "i") } },
        { "name.vi": { $regex: new RegExp(`^${row["Block Name"]}$`, "i") } },
      ],
    });
    if (!block) {
      errors.push({
        field: "Block Name",
        message: `Block Name "${row["Block Name"]}" not found in master data`,
      });
    }
  }

  // Validate Property Type
  if (row["Property Type"]) {
    const propertyType = await PropertyType.findOne({
      $or: [
        { "name.en": { $regex: new RegExp(`^${row["Property Type"]}$`, "i") } },
        { "name.vi": { $regex: new RegExp(`^${row["Property Type"]}$`, "i") } },
      ],
    });
    if (!propertyType) {
      errors.push({
        field: "Property Type",
        message: `Property Type "${row["Property Type"]}" not found in master data`,
      });
    }
  }

  // Validate Currency
  if (row["Currency"]) {
    const currency = await Currency.findOne({
      $or: [
        { "currencyCode.en": { $regex: new RegExp(`^${row["Currency"]}$`, "i") } },
        { "currencyCode.vi": { $regex: new RegExp(`^${row["Currency"]}$`, "i") } },
      ],
    });
    if (!currency) {
      errors.push({
        field: "Currency",
        message: `Currency "${row["Currency"]}" not found in master data`,
      });
    }
  }

  // Validate Furnishing
  if (row["Furnishing"]) {
    const furnishing = await Furnishing.findOne({
      $or: [
        { "name.en": { $regex: new RegExp(`^${row["Furnishing"]}$`, "i") } },
        { "name.vi": { $regex: new RegExp(`^${row["Furnishing"]}$`, "i") } },
      ],
    });
    if (!furnishing) {
      errors.push({
        field: "Furnishing",
        message: `Furnishing "${row["Furnishing"]}" not found in master data`,
      });
    }
  }

  // Validate Floor Range
  if (row["Floor Range"]) {
    const floorRange = await FloorRange.findOne({
      $or: [
        { "name.en": { $regex: new RegExp(`^${row["Floor Range"]}$`, "i") } },
        { "name.vi": { $regex: new RegExp(`^${row["Floor Range"]}$`, "i") } },
      ],
    });
    if (!floorRange) {
      errors.push({
        field: "Floor Range",
        message: `Floor Range "${row["Floor Range"]}" not found in master data`,
      });
    }
  }

  // Validate Unit
  if (row["Unit"]) {
    const unit = await Unit.findOne({
      $or: [
        { "name.en": { $regex: new RegExp(`^${row["Unit"]}$`, "i") } },
        { "name.vi": { $regex: new RegExp(`^${row["Unit"]}$`, "i") } },
        { "symbol.en": { $regex: new RegExp(`^${row["Unit"]}$`, "i") } },
        { "symbol.vi": { $regex: new RegExp(`^${row["Unit"]}$`, "i") } },
      ],
    });
    if (!unit) {
      errors.push({
        field: "Unit",
        message: `Unit "${row["Unit"]}" not found in master data`,
      });
    }
  }

  // Validate required fields based on transaction type
  const requiredFields = [
    "Project / Community",
    "Property Type",
    "Property Title",
    "Currency",
  ];

  if (transactionType === "Lease") {
    requiredFields.push("Lease Price");
  } else if (transactionType === "Sale") {
    requiredFields.push("Sale Price");
  } else if (transactionType === "Home Stay") {
    requiredFields.push("Price Per Night");
  }

  requiredFields.forEach((field) => {
    if (!row[field] || row[field].trim() === "") {
      errors.push({
        field,
        message: `${field} is required`,
      });
    }
  });

  // Validate numeric fields
  const numericFields = ["Unit Size", "Bedrooms", "Bathrooms"];
  if (transactionType === "Lease" && row["Lease Price"]) {
    numericFields.push("Lease Price");
  }
  if (transactionType === "Sale" && row["Sale Price"]) {
    numericFields.push("Sale Price");
  }
  if (transactionType === "Home Stay" && row["Price Per Night"]) {
    numericFields.push("Price Per Night");
  }

  numericFields.forEach((field) => {
    if (row[field] && isNaN(Number(row[field]))) {
      errors.push({
        field,
        message: `${field} must be a valid number`,
      });
    }
  });

  // Validate date fields
  if (row["Available From"]) {
    const date = new Date(row["Available From"]);
    if (isNaN(date.getTime())) {
      errors.push({
        field: "Available From",
        message: "Available From must be a valid date (YYYY-MM-DD)",
      });
    }
  }

  return errors;
}

/* =========================================================
   📤 BULK UPLOAD PROPERTIES
========================================================= */
exports.bulkUploadProperties = asyncHandler(async (req, res) => {
  try {
    console.log("📥 Bulk Upload Request Body Keys:", Object.keys(req.body));
    console.log("📥 CSV Data exists:", !!req.body.csvData);
    console.log("📥 Transaction Type:", req.body.transactionType);
    console.log("📥 Validate Only:", req.body.validateOnly);
    
    const { csvData, transactionType, validateOnly } = req.body;

    if (!csvData) {
      throw new ErrorResponse("CSV data is required", 400);
    }

    if (!transactionType) {
      throw new ErrorResponse("Transaction type is required", 400);
    }

    // Parse CSV
    const parseResult = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(), // Trim all cell values
    });

    if (parseResult.errors.length > 0) {
      throw new ErrorResponse("CSV parsing failed: " + parseResult.errors[0].message, 400);
    }

    const rows = parseResult.data;
    const results = {
      total: rows.length,
      successful: 0,
      failed: 0,
      errors: [],
      successfulProperties: [],
      validRows: [], // Store valid row data for later upload
    };

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 because row 1 is header, and we're 0-indexed

      try {
        // Validate master fields
        const validationErrors = await validateMasterFields(row, transactionType);

        if (validationErrors.length > 0) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            data: row,
            errors: validationErrors,
          });
          continue;
        }

        // Check for duplicate Property No
        if (row["Property No"]) {
          const existing = await CreateProperty.findOne({
            $or: [
              { "listingInformation.listingInformationPropertyNo.en": row["Property No"] },
              { "listingInformation.listingInformationPropertyNo.vi": row["Property No"] },
            ],
          });

          if (existing) {
            results.failed++;
            results.errors.push({
              row: rowNumber,
              data: row,
              errors: [
                {
                  field: "Property No",
                  message: `Property No "${row["Property No"]}" already exists`,
                },
              ],
            });
            continue;
          }
        }

        // If validateOnly mode, just count as valid and store the row
        if (validateOnly) {
          results.successful++;
          results.validRows.push({ rowNumber, data: row });
          continue;
        }

        // Otherwise, create the property
        const propertyId = await generateNextPropertyId(transactionType);

        // Build property object
        const propertyData = {
          listingInformation: {
            listingInformationPropertyId: propertyId,
            listingInformationPropertyNo: normalizeLocalized(row["Property No"]),
            listingInformationTransactionType: normalizeLocalized(transactionType),
            listingInformationProjectCommunity: normalizeLocalized(row["Project / Community"]),
            listingInformationZoneSubArea: normalizeLocalized(row["Area / Zone"]),
            listingInformationBlockName: normalizeLocalized(row["Block Name"]),
            listingInformationPropertyType: normalizeLocalized(row["Property Type"]),
            listingInformationPropertyTitle: normalizeLocalized(row["Property Title"]),
            listingInformationAvailableFrom: row["Available From"] ? new Date(row["Available From"]) : null,
          },
          propertyInformation: {
            informationUnit: normalizeLocalized(row["Unit"]),
            informationUnitSize: row["Unit Size"] ? Number(row["Unit Size"]) : 0,
            informationBedrooms: row["Bedrooms"] ? Number(row["Bedrooms"]) : 0,
            informationBathrooms: row["Bathrooms"] ? Number(row["Bathrooms"]) : 0,
            informationFloors: row["Floor Range"] || 1,
            informationFurnishing: normalizeLocalized(row["Furnishing"]),
            informationView: normalizeLocalized(row["View"]),
          },
          whatNearby: {
            whatNearbyDescription: normalizeLocalized(row["Description"]),
          },
          financialDetails: {
            financialDetailsCurrency: row["Currency"] || "USD",
          },
          status: "Draft",
          createdBy: req.user?.id || null,
        };

        // Add price based on transaction type
        if (transactionType === "Lease") {
          propertyData.financialDetails.financialDetailsLeasePrice = row["Lease Price"]
            ? Number(row["Lease Price"])
            : 0;
        } else if (transactionType === "Sale") {
          propertyData.financialDetails.financialDetailsPrice = row["Sale Price"]
            ? Number(row["Sale Price"])
            : 0;
        } else if (transactionType === "Home Stay") {
          propertyData.financialDetails.financialDetailsPricePerNight = row["Price Per Night"]
            ? Number(row["Price Per Night"])
            : 0;
        }

        // Create property
        const newProperty = await CreateProperty.create(propertyData);

        results.successful++;
        results.successfulProperties.push({
          row: rowNumber,
          propertyId: newProperty.listingInformation.listingInformationPropertyId,
        });
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          data: row,
          errors: [
            {
              field: "General",
              message: error.message || "Failed to create property",
            },
          ],
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk upload completed: ${results.successful} successful, ${results.failed} failed`,
      data: results,
    });
  } catch (error) {
    console.error("❌ BULK UPLOAD ERROR:", error);
    throw error;
  }
});
