const Category = require("../models/Category");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../utils/asyncHandler");

/* =========================================================
   📋 GET ALL CATEGORIES
========================================================= */
exports.getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

/* =========================================================
   📋 GET SINGLE CATEGORY BY ID
========================================================= */
exports.getCategoryById = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

/* =========================================================
   ✏️ CREATE NEW CATEGORY
========================================================= */
exports.createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    data: category,
  });
});

/* =========================================================
   🔄 UPDATE CATEGORY
========================================================= */
exports.updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id ${req.params.id}`, 404)
    );
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: category,
  });
});

/* =========================================================
   🗑️ DELETE CATEGORY
========================================================= */
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id ${req.params.id}`, 404)
    );
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
