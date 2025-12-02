const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Deposit = require("../models/Deposit");
const CreateProperty = require("../models/CreateProperty");

// @desc    Get all Deposits
// @route   GET /api/v1/deposit
exports.getDeposits = asyncHandler(async (req, res) => {
  const deposits = await Deposit.aggregate([
    {
      $addFields: {
        numericCode: { $toInt: "$code.en" }
      }
    },
    { $sort: { numericCode: 1 } } // ASCENDING
  ]);

  res.status(200).json({
    success: true,
    data: deposits,
  });
});


// @desc    Create Deposit
exports.createDeposit = asyncHandler(async (req, res) => {
  const { name_en, name_vi, status } = req.body;

  if (!name_en || !name_vi) {
    throw new ErrorResponse("Deposit name EN & VI required", 400);
  }

  // ❌ Prevent duplicate name
  const existing = await Deposit.findOne({
    $or: [
      { "name.en": { $regex: new RegExp(`^${name_en}$`, "i") } },
      { "name.vi": { $regex: new RegExp(`^${name_vi}$`, "i") } }
    ]
  });

  if (existing) {
    throw new ErrorResponse("Deposit with this name already exists", 400);
  }

  // Generate auto code
  const allDeposits = await Deposit.find().lean();

  const numericCodes = allDeposits
    .map((d) => parseInt(d.code?.en))
    .filter((n) => !isNaN(n));

  let nextNumber = 1;
  if (numericCodes.length > 0) {
    nextNumber = Math.max(...numericCodes) + 1;
  }

  const autoCode = String(nextNumber).padStart(3, "0");

  const newDeposit = await Deposit.create({
    code: { en: autoCode, vi: autoCode },
    name: { en: name_en, vi: name_vi },
    status: status || "Active",
  });

  res.status(201).json({
    success: true,
    message: "Deposit created successfully",
    data: newDeposit,
  });
});

// @desc    Update Deposit
exports.updateDeposit = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, status } = req.body;

  const deposit = await Deposit.findById(req.params.id);
  if (!deposit) throw new ErrorResponse("Deposit not found", 404);

  // ❌ Prevent duplicate name on update
  if (name_en || name_vi) {
    const duplicate = await Deposit.findOne({
      _id: { $ne: deposit._id },
      $or: [
        { "name.en": { $regex: new RegExp(`^${name_en || deposit.name.en}$`, "i") } },
        { "name.vi": { $regex: new RegExp(`^${name_vi || deposit.name.vi}$`, "i") } }
      ]
    });

    if (duplicate) {
      throw new ErrorResponse("Deposit with this name already exists", 400);
    }
  }

  deposit.code.en = code_en ?? deposit.code.en;
  deposit.code.vi = code_vi ?? deposit.code.vi;
  deposit.name.en = name_en ?? deposit.name.en;
  deposit.name.vi = name_vi ?? deposit.name.vi;
  deposit.status = status ?? deposit.status;

  await deposit.save();

  res.status(200).json({
    success: true,
    message: "Deposit updated successfully",
    data: deposit,
  });
});

// @desc    Delete Deposit
exports.deleteDeposit = asyncHandler(async (req, res) => {
  const deposit = await Deposit.findById(req.params.id);
  if (!deposit) throw new ErrorResponse("Deposit not found", 404);

  const isUsed = await CreateProperty.exists({
    $or: [
      { "financialDetails.financialDetailsDeposit.en": deposit.name.en },
      { "financialDetails.financialDetailsDeposit.vi": deposit.name.vi }
    ]
  });

  if (isUsed) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete this master data because it is present in a created property. Delete the property first."
    });
  }

  await deposit.deleteOne();

  res.status(200).json({
    success: true,
    message: "Deposit deleted successfully",
  });
});
