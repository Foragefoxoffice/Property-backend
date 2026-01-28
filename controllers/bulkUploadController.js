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

  // Helper to get value from localized object or string
  const getValue = (field) => {
    const val = row[field];
    if (!val) return "";
    if (typeof val === "object") {
      return val.en || val.vi || "";
    }
    return val;
  };

  // Helper to validate both EN and VI values against master data
  const validateBothLanguages = async (fieldName, modelName, Model) => {
    const field = row[fieldName];
    if (!field) return;

    const enValue = typeof field === "object" ? (field.en || "") : field;
    const viValue = typeof field === "object" ? (field.vi || "") : field;

    if (enValue || viValue) {
      // Validate English value
      if (enValue) {
        const foundEn = await Model.findOne({
          $or: [
            { "name.en": { $regex: new RegExp(`^${enValue}$`, "i") } },
            { "name.vi": { $regex: new RegExp(`^${enValue}$`, "i") } },
          ],
        });
        if (!foundEn) {
          errors.push({
            field: `${fieldName} (English)`,
            message: `${modelName} "${enValue}" not found in master data`,
          });
        }
      }

      // Validate Vietnamese value if different
      if (viValue && viValue !== enValue) {
        const foundVi = await Model.findOne({
          $or: [
            { "name.en": { $regex: new RegExp(`^${viValue}$`, "i") } },
            { "name.vi": { $regex: new RegExp(`^${viValue}$`, "i") } },
          ],
        });
        if (!foundVi) {
          errors.push({
            field: `${fieldName} (Vietnamese)`,
            message: `${modelName} "${viValue}" not found in master data`,
          });
        }
      }
    }
  };

  // Validate Project / Community
  const projectField = row["Project / Community"];
  if (projectField) {
    // Get both EN and VI values
    const projectEnValue = typeof projectField === "object" ? (projectField.en || "") : projectField;
    const projectViValue = typeof projectField === "object" ? (projectField.vi || "") : projectField;

    // Check if at least one value is provided
    if (projectEnValue || projectViValue) {
      // Validate English value if provided
      if (projectEnValue) {
        const projectEn = await Property.findOne({
          $or: [
            { "name.en": { $regex: new RegExp(`^${projectEnValue}$`, "i") } },
            { "name.vi": { $regex: new RegExp(`^${projectEnValue}$`, "i") } },
          ],
        });
        if (!projectEn) {
          errors.push({
            field: "Project / Community (English)",
            message: `Project/Community "${projectEnValue}" not found in master data`,
          });
        }
      }

      // Validate Vietnamese value if provided and different from English
      if (projectViValue && projectViValue !== projectEnValue) {
        const projectVi = await Property.findOne({
          $or: [
            { "name.en": { $regex: new RegExp(`^${projectViValue}$`, "i") } },
            { "name.vi": { $regex: new RegExp(`^${projectViValue}$`, "i") } },
          ],
        });
        if (!projectVi) {
          errors.push({
            field: "Project / Community (Vietnamese)",
            message: `Project/Community "${projectViValue}" not found in master data`,
          });
        }
      }
    }
  }

  // Validate Area / Zone
  await validateBothLanguages("Area / Zone", "Area/Zone", ZoneSubArea);

  // Validate Block Name
  await validateBothLanguages("Block Name", "Block Name", Block);

  // Validate Property Type
  await validateBothLanguages("Property Type", "Property Type", PropertyType);

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
  await validateBothLanguages("Furnishing", "Furnishing", Furnishing);

  // Validate Floor Range
  await validateBothLanguages("Floor Range", "Floor Range", FloorRange);

  // Validate Unit (checks both name and symbol)
  const unitField = row["Unit"];
  if (unitField) {
    const unitEnValue = typeof unitField === "object" ? (unitField.en || "") : unitField;
    const unitViValue = typeof unitField === "object" ? (unitField.vi || "") : unitField;

    if (unitEnValue) {
      const unitEn = await Unit.findOne({
        $or: [
          { "name.en": { $regex: new RegExp(`^${unitEnValue}$`, "i") } },
          { "name.vi": { $regex: new RegExp(`^${unitEnValue}$`, "i") } },
          { "symbol.en": { $regex: new RegExp(`^${unitEnValue}$`, "i") } },
          { "symbol.vi": { $regex: new RegExp(`^${unitEnValue}$`, "i") } },
        ],
      });
      if (!unitEn) {
        errors.push({
          field: "Unit (English)",
          message: `Unit "${unitEnValue}" not found in master data`,
        });
      }
    }

    if (unitViValue && unitViValue !== unitEnValue) {
      const unitVi = await Unit.findOne({
        $or: [
          { "name.en": { $regex: new RegExp(`^${unitViValue}$`, "i") } },
          { "name.vi": { $regex: new RegExp(`^${unitViValue}$`, "i") } },
          { "symbol.en": { $regex: new RegExp(`^${unitViValue}$`, "i") } },
          { "symbol.vi": { $regex: new RegExp(`^${unitViValue}$`, "i") } },
        ],
      });
      if (!unitVi) {
        errors.push({
          field: "Unit (Vietnamese)",
          message: `Unit "${unitViValue}" not found in master data`,
        });
      }
    }
  }

  // Validate required fields - only Project/Community, Area/Zone, and Block Name are mandatory
  const requiredFields = [
    "Project / Community",
    "Area / Zone",
    "Block Name",
  ];

  requiredFields.forEach((field) => {
    const value = getValue(field);
    if (!value || value.trim() === "") {
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

    // Parse CSV with UTF-8 encoding
    const parseResult = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(), // Trim all cell values
    });

    if (parseResult.errors.length > 0) {
      throw new ErrorResponse("CSV parsing failed: " + parseResult.errors[0].message, 400);
    }

    const rows = parseResult.data;

    // Process rows to merge EN/VI columns into localized objects
    const processedRows = rows.map(row => {
      const processed = {};
      const fieldTranslations = {
        "Dự án / Cộng đồng": "Project / Community",
        "Khu vực / Vùng": "Area / Zone",
        "Tên khối": "Block Name",
        "Số bất động sản": "Property No",
        "Loại bất động sản": "Property Type",
        "Có sẵn từ": "Available From",
        "Đơn vị": "Unit",
        "Diện tích": "Unit Size",
        "Phòng ngủ": "Bedrooms",
        "Phòng tắm": "Bathrooms",
        "Phạm vi tầng": "Floor Range",
        "Trang bị nội thất": "Furnishing",
        "Hướng nhìn": "View",
        "Tiêu đề bất động sản": "Property Title",
        "Mô tả": "Description",
        "Tiền tệ": "Currency",
        "Giá thuê": "Lease Price",
        "Giá bán": "Sale Price",
        "Giá mỗi đêm": "Price Per Night",
      };

      // Group EN/VI pairs
      const enFields = {};
      const viFields = {};

      Object.keys(row).forEach(key => {
        if (fieldTranslations[key]) {
          // It's a Vietnamese column
          viFields[fieldTranslations[key]] = row[key];
        } else {
          // It's an English column
          enFields[key] = row[key];
        }
      });

      // Merge into localized objects
      Object.keys(enFields).forEach(field => {
        const enValue = enFields[field] || "";
        const viValue = viFields[field] || "";

        // For numeric/date/currency/identifier fields, just use English value
        if (field === "Property No" || field === "Unit Size" || field === "Bedrooms" ||
          field === "Bathrooms" || field.includes("Price") ||
          field === "Available From" || field === "Currency") {
          processed[field] = enValue;
        } else {
          // Create localized object
          processed[field] = enValue || viValue ? { en: enValue, vi: viValue } : "";
        }
      });

      return processed;
    });

    const results = {
      total: processedRows.length,
      successful: 0,
      failed: 0,
      errors: [],
      successfulProperties: [],
      validRows: [], // Store valid row data for later upload
    };

    // Process each row
    for (let i = 0; i < processedRows.length; i++) {
      const row = processedRows[i];
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

        // Check for duplicate Property No within the SAME section
        if (row["Property No"]) {
          const transEn = transactionType;
          const propNo = row["Property No"];

          const existing = await CreateProperty.findOne({
            status: { $ne: "Archived" },
            // Check if Property No matches in either language
            $and: [
              {
                $or: [
                  { "listingInformation.listingInformationPropertyNo.en": propNo },
                  { "listingInformation.listingInformationPropertyNo.vi": propNo },
                ]
              },
              {
                // Check if Transaction Type matches in either language
                $or: [
                  { "listingInformation.listingInformationTransactionType.en": transEn },
                  { "listingInformation.listingInformationTransactionType.vi": transEn },
                ]
              }
            ]
          });

          if (existing) {
            results.failed++;
            results.errors.push({
              row: rowNumber,
              data: row,
              errors: [
                {
                  field: "Property No",
                  message: `Property No "${propNo}" already exists in the ${transEn} section`,
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
            listingInformationProjectCommunity: row["Project / Community"] || normalizeLocalized(""),
            listingInformationZoneSubArea: row["Area / Zone"] || normalizeLocalized(""),
            listingInformationBlockName: row["Block Name"] || normalizeLocalized(""),
            listingInformationPropertyType: row["Property Type"] || normalizeLocalized(""),
            listingInformationPropertyTitle: row["Property Title"] || normalizeLocalized(""),
            listingInformationAvailableFrom: row["Available From"] ? new Date(row["Available From"]) : null,
          },
          propertyInformation: {
            informationUnit: row["Unit"] || normalizeLocalized(""),
            informationUnitSize: row["Unit Size"] ? Number(row["Unit Size"]) : 0,
            informationBedrooms: row["Bedrooms"] ? Number(row["Bedrooms"]) : 0,
            informationBathrooms: row["Bathrooms"] ? Number(row["Bathrooms"]) : 0,
            informationFloors: row["Floor Range"] || normalizeLocalized(""),
            informationFurnishing: row["Furnishing"] || normalizeLocalized(""),
            informationView: row["View"] || normalizeLocalized(""),
          },
          whatNearby: {
            whatNearbyDescription: row["Description"] || normalizeLocalized(""),
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
