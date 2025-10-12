const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Payment = require("../models/Payment");

// @desc    Get all Payments
// @route   GET /api/v1/payment
exports.getPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const payments = await Payment.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Payment.countDocuments();

  res.status(200).json({
    success: true,
    count: payments.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    data: payments,
  });
});

// @desc    Create Payment
// @route   POST /api/v1/payment
exports.createPayment = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, status } = req.body;

  if (!code_en || !code_vi || !name_en || !name_vi) {
    throw new ErrorResponse(
      "All English and Vietnamese fields are required",
      400
    );
  }

  const existing = await Payment.findOne({
    $or: [{ "code.en": code_en }, { "code.vi": code_vi }],
  });
  if (existing) throw new ErrorResponse("Payment code already exists", 400);

  const newPayment = await Payment.create({
    code: { en: code_en, vi: code_vi },
    name: { en: name_en, vi: name_vi },
    status: status || "Active",
  });

  res.status(201).json({
    success: true,
    message: "Payment created successfully",
    data: newPayment,
  });
});

// @desc    Update Payment
// @route   PUT /api/v1/payment/:id
exports.updatePayment = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, status } = req.body;

  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new ErrorResponse("Payment not found", 404);

  payment.code.en = code_en ?? payment.code.en;
  payment.code.vi = code_vi ?? payment.code.vi;
  payment.name.en = name_en ?? payment.name.en;
  payment.name.vi = name_vi ?? payment.name.vi;
  payment.status = status ?? payment.status;

  await payment.save();

  res.status(200).json({
    success: true,
    message: "Payment updated successfully",
    data: payment,
  });
});

// @desc    Delete Payment
// @route   DELETE /api/v1/payment/:id
exports.deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new ErrorResponse("Payment not found", 404);

  await payment.deleteOne();

  res.status(200).json({
    success: true,
    message: "Payment deleted successfully",
  });
});
