const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Payment = require("../models/Payment");
const CreateProperty = require("../models/CreateProperty");

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
exports.createPayment = asyncHandler(async (req, res) => {
  const { name_en, name_vi, status } = req.body;

  if (!name_en || !name_vi) {
    throw new ErrorResponse(
      "All English and Vietnamese fields are required",
      400
    );
  }

  // ❌ Prevent duplicate name
  const existing = await Payment.findOne({
    $or: [
      { "name.en": { $regex: new RegExp(`^${name_en}$`, "i") } },
      { "name.vi": { $regex: new RegExp(`^${name_vi}$`, "i") } }
    ],
  });

  if (existing) {
    throw new ErrorResponse("Payment with this name already exists", 400);
  }

  // Generate next sequence code
  const allPayments = await Payment.find().lean();

  const numericCodes = allPayments
    .map((p) => parseInt(p.code?.en))
    .filter((n) => !isNaN(n));

  let nextNumber = 1;
  if (numericCodes.length > 0) {
    nextNumber = Math.max(...numericCodes) + 1;
  }

  const autoCode = String(nextNumber).padStart(3, "0");

  const newPayment = await Payment.create({
    code: { en: autoCode, vi: autoCode },
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
exports.updatePayment = asyncHandler(async (req, res) => {
  const { name_en, name_vi, status } = req.body;

  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new ErrorResponse("Payment not found", 404);

  // ❌ Prevent duplicate name on update
  if (name_en || name_vi) {
    const duplicate = await Payment.findOne({
      _id: { $ne: payment._id },
      $or: [
        { "name.en": { $regex: new RegExp(`^${name_en || payment.name.en}$`, "i") } },
        { "name.vi": { $regex: new RegExp(`^${name_vi || payment.name.vi}$`, "i") } }
      ]
    });

    if (duplicate) {
      throw new ErrorResponse("Payment with this name already exists", 400);
    }
  }

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
// @desc    Delete Payment
// @route   DELETE /api/v1/payment/:id
exports.deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new ErrorResponse("Payment not found", 404);

  const isUsed = await CreateProperty.exists({
    $or: [
      { "financialDetails.financialDetailsTerms.en": payment.name.en },
      { "financialDetails.financialDetailsTerms.vi": payment.name.vi }
    ]
  });

  if (isUsed) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete this master data because it is present in a created property. Delete the property first."
    });
  }

  await payment.deleteOne();

  res.status(200).json({
    success: true,
    message: "Payment deleted successfully",
  });
});
