const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Deposit = require("../models/Deposit");

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

  // Find all codes and compute next number
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
// @route   PUT /api/v1/deposit/:id
exports.updateDeposit = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, status } = req.body;

  const deposit = await Deposit.findById(req.params.id);
  if (!deposit) throw new ErrorResponse("Deposit not found", 404);

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
// @route   DELETE /api/v1/deposit/:id
exports.deleteDeposit = asyncHandler(async (req, res) => {
  const deposit = await Deposit.findById(req.params.id);
  if (!deposit) throw new ErrorResponse("Deposit not found", 404);

  await deposit.deleteOne();

  res.status(200).json({
    success: true,
    message: "Deposit deleted successfully",
  });
});
