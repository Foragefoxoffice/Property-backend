const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const SalesAgentFee = require("../models/SalesAgentFee");
const CreateProperty = require("../models/CreateProperty");

// ✅ GET ALL
exports.getSalesAgentFee = asyncHandler(async (req, res) => {
  const records = await SalesAgentFee.aggregate([
    { $addFields: { numericCode: { $toInt: "$code.en" } } },
    { $sort: { numericCode: 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: records,
  });
});

// ✅ CREATE
exports.createSalesAgentFee = asyncHandler(async (req, res) => {
  const { name_en, name_vi, status } = req.body;

  if (!name_en || !name_vi) {
    throw new ErrorResponse("Name EN & VI are required", 400);
  }

  // ❌ Prevent duplicate name
  const existing = await SalesAgentFee.findOne({
    $or: [
      { "name.en": { $regex: new RegExp(`^${name_en}$`, "i") } },
      { "name.vi": { $regex: new RegExp(`^${name_vi}$`, "i") } }
    ]
  });

  if (existing) {
    throw new ErrorResponse("Sales Agent Fee with this name already exists", 400);
  }

  // Compute next auto code
  const existingCodes = await SalesAgentFee.find({}, { "code.en": 1 }).lean();

  const numericCodes = existingCodes
    .map(r => parseInt(r.code?.en))
    .filter(n => !isNaN(n));

  let nextNumber = 1;
  if (numericCodes.length > 0) {
    nextNumber = Math.max(...numericCodes) + 1;
  }

  const autoCode = String(nextNumber).padStart(3, "0");

  const newRecord = await SalesAgentFee.create({
    code: { en: autoCode, vi: autoCode },
    name: { en: name_en, vi: name_vi },
    status: status || "Active",
  });

  res.status(201).json({
    success: true,
    message: "Sales Agent Fee created successfully",
    data: newRecord,
  });
});

// ✅ UPDATE
exports.updateSalesAgentFee = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, status } = req.body;

  const record = await SalesAgentFee.findById(req.params.id);
  if (!record) throw new ErrorResponse("Sales Agent Fee not found", 404);

  // ❌ Prevent duplicate names on update
  if (name_en || name_vi) {
    const duplicate = await SalesAgentFee.findOne({
      _id: { $ne: record._id },
      $or: [
        { "name.en": { $regex: new RegExp(`^${name_en || record.name.en}$`, "i") } },
        { "name.vi": { $regex: new RegExp(`^${name_vi || record.name.vi}$`, "i") } }
      ]
    });

    if (duplicate) {
      throw new ErrorResponse("Sales Agent Fee with this name already exists", 400);
    }
  }

  record.code.en = code_en ?? record.code.en;
  record.code.vi = code_vi ?? record.code.vi;
  record.name.en = name_en ?? record.name.en;
  record.name.vi = name_vi ?? record.name.vi;
  record.status = status ?? record.status;

  await record.save();

  res.status(200).json({
    success: true,
    message: "Sales Agent Fee updated successfully",
    data: record,
  });
});

// ✅ DELETE
exports.deleteSalesAgentFee = asyncHandler(async (req, res) => {
  const record = await SalesAgentFee.findById(req.params.id);
  if (!record) throw new ErrorResponse("Sales Agent Fee not found", 404);

  // Check if used ONLY in Sale properties (Sales Agent Fee Master is specific to Sale properties)
  const isUsed = await CreateProperty.exists({
    $and: [
      {
        $or: [
          { "listingInformation.listingInformationTransactionType.en": "Sale" },
          { "listingInformation.listingInformationTransactionType.vi": "Bán" },
          { "listingInformation.listingInformationTransactionType": "Sale" }
        ]
      },
      {
        $or: [
          { "financialDetails.financialDetailsAgentFee.en": record.name.en },
          { "financialDetails.financialDetailsAgentFee.vi": record.name.vi }
        ]
      }
    ]
  });

  if (isUsed) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete this master data because it is present in a created Sale property. Delete or update the property first."
    });
  }

  await record.deleteOne();

  res.status(200).json({
    success: true,
    message: "Sales Agent Fee deleted successfully",
  });
});
