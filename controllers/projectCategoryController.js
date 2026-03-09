const ProjectCategory = require("../models/ProjectCategory");
const Project = require("../models/Project");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../utils/asyncHandler");

exports.getAllCategories = asyncHandler(async (req, res, next) => {
    const categories = await ProjectCategory.find().sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        count: categories.length,
        data: categories,
    });
});

exports.getCategoryById = asyncHandler(async (req, res, next) => {
    const category = await ProjectCategory.findById(req.params.id);
    if (!category) {
        return next(new ErrorResponse(`Category not found with id ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        data: category,
    });
});

exports.createCategory = asyncHandler(async (req, res, next) => {
    const category = await ProjectCategory.create(req.body);
    res.status(201).json({
        success: true,
        data: category,
    });
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
    let category = await ProjectCategory.findById(req.params.id);
    if (!category) {
        return next(new ErrorResponse(`Category not found with id ${req.params.id}`, 404));
    }
    category = await ProjectCategory.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        success: true,
        data: category,
    });
});

exports.deleteCategory = asyncHandler(async (req, res, next) => {
    const category = await ProjectCategory.findById(req.params.id);
    if (!category) {
        return next(new ErrorResponse(`Category not found with id ${req.params.id}`, 404));
    }
    const projectCount = await Project.countDocuments({ category: req.params.id });
    if (projectCount > 0) {
        return next(new ErrorResponse("Cannot delete category because it has projects assigned to it.", 400));
    }
    await category.deleteOne();
    res.status(200).json({
        success: true,
        data: {},
    });
});
