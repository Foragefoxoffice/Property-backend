const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Deposit = require("../models/Deposit");

// @desc    Get all Deposits
// @route   GET /api/v1/deposit
exports.getDeposits = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const deposits = await Deposit.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Deposit.countDocuments();

  res.status(200).json({
    success: true,
    count: deposits.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    data: deposits,
  });
});

// @desc    Create Deposit
// @route   POST /api/v1/deposit
exports.createDeposit = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, status } = req.body;

  if (!code_en || !code_vi || !name_en || !name_vi) {
    throw new ErrorResponse(
      "All English and Vietnamese fields are required",
      400
    );
  }

  const existing = await Deposit.findOne({
    $or: [{ "code.en": code_en }, { "code.vi": code_vi }],
  });
  if (existing) throw new ErrorResponse("Deposit code already exists", 400);

  const newDeposit = await Deposit.create({
    code: { en: code_en, vi: code_vi },
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
