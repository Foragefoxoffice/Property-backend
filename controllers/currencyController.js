const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Currency = require("../models/Currency");

/* =========================================================
   @desc    Get all currencies
   @route   GET /api/v1/currency
========================================================= */
exports.getCurrencies = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const currencies = await Currency.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Currency.countDocuments();

  res.status(200).json({
    success: true,
    count: currencies.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    data: currencies,
  });
});

/* =========================================================
   @desc    Create a currency
   @route   POST /api/v1/currency
========================================================= */
exports.createCurrency = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, symbol_en, symbol_vi, status } =
    req.body;

  if (
    !code_en ||
    !code_vi ||
    !name_en ||
    !name_vi ||
    !symbol_en ||
    !symbol_vi
  ) {
    throw new ErrorResponse(
      "All English and Vietnamese fields are required",
      400
    );
  }

  const existing = await Currency.findOne({
    $or: [{ "currencyCode.en": code_en }, { "currencyCode.vi": code_vi }],
  });

  if (existing) {
    throw new ErrorResponse("Currency code already exists", 400);
  }

  const newCurrency = await Currency.create({
    currencyCode: { en: code_en, vi: code_vi },
    currencyName: { en: name_en, vi: name_vi },
    currencySymbol: { en: symbol_en, vi: symbol_vi },
    status: status || "Active",
  });

  res.status(201).json({
    success: true,
    message: "Currency created successfully",
    data: newCurrency,
  });
});

/* =========================================================
   @desc    Update a currency
   @route   PUT /api/v1/currency/:id
========================================================= */
exports.updateCurrency = asyncHandler(async (req, res) => {
  const { code_en, code_vi, name_en, name_vi, symbol_en, symbol_vi, status } =
    req.body;

  const currency = await Currency.findById(req.params.id);
  if (!currency) throw new ErrorResponse("Currency not found", 404);

  currency.currencyCode.en = code_en ?? currency.currencyCode.en;
  currency.currencyCode.vi = code_vi ?? currency.currencyCode.vi;
  currency.currencyName.en = name_en ?? currency.currencyName.en;
  currency.currencyName.vi = name_vi ?? currency.currencyName.vi;
  currency.currencySymbol.en = symbol_en ?? currency.currencySymbol.en;
  currency.currencySymbol.vi = symbol_vi ?? currency.currencySymbol.vi;
  currency.status = status ?? currency.status;

  await currency.save();

  res.status(200).json({
    success: true,
    message: "Currency updated successfully",
    data: currency,
  });
});

/* =========================================================
   @desc    Delete a currency
   @route   DELETE /api/v1/currency/:id
========================================================= */
exports.deleteCurrency = asyncHandler(async (req, res) => {
  const currency = await Currency.findById(req.params.id);
  if (!currency) throw new ErrorResponse("Currency not found", 404);

  await currency.deleteOne();

  res.status(200).json({
    success: true,
    message: "Currency deleted successfully",
  });
});

/* =========================================================
   @desc    Mark a currency as default
   @route   PUT /api/v1/currency/:id/default
========================================================= */
exports.markAsDefault = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const currency = await Currency.findById(id);
  if (!currency) throw new ErrorResponse("Currency not found", 404);

  // Reset defaults
  await Currency.updateMany({}, { $set: { isDefault: false } });

  // Set current one as default
  currency.isDefault = true;
  await currency.save();

  res.status(200).json({
    success: true,
    message: "Currency marked as default successfully",
    data: currency,
  });
});
