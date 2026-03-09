const Project = require("../models/Project");
const ProjectCategory = require("../models/ProjectCategory");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../utils/asyncHandler");

// @desc      Get all projects
// @route     GET /api/v1/projects
// @access    Public
exports.getAllProjects = asyncHandler(async (req, res, next) => {
    const projects = await Project.find({ published: true })
        .populate("category")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: projects.length,
        data: projects,
    });
});

// @desc      Get all projects for admin
// @route     GET /api/v1/projects/admin/all
// @access    Private (Admin)
exports.getAdminProjects = asyncHandler(async (req, res, next) => {
    const projects = await Project.find()
        .populate("category")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: projects.length,
        data: projects,
    });
});

// @desc      Get single project by ID
// @route     GET /api/v1/projects/:id
// @access    Private (Admin)
exports.getProjectById = asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.id).populate("category");

    if (!project) {
        return next(new ErrorResponse("Project not found", 404));
    }

    res.status(200).json({
        success: true,
        data: project,
    });
});

// @desc      Get single project by Slug
// @route     GET /api/v1/projects/slug/:slug
// @access    Public
exports.getProjectBySlug = asyncHandler(async (req, res, next) => {
    const { slug } = req.params;
    const project = await Project.findOne({
        $or: [{ "slug.en": slug }, { "slug.vi": slug }],
        published: true,
    }).populate("category");

    if (!project) {
        return next(new ErrorResponse("Project not found", 404));
    }

    res.status(200).json({
        success: true,
        data: project,
    });
});

// @desc      Create new project
// @route     POST /api/v1/projects
// @access    Private (Admin)
exports.createProject = asyncHandler(async (req, res, next) => {
    const project = await Project.create(req.body);

    res.status(201).json({
        success: true,
        data: project,
    });
});

// @desc      Update project
// @route     PUT /api/v1/projects/:id
// @access    Private (Admin)
exports.updateProject = asyncHandler(async (req, res, next) => {
    let project = await Project.findById(req.params.id);

    if (!project) {
        return next(new ErrorResponse("Project not found", 404));
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: project,
    });
});

// @desc      Delete project
// @route     DELETE /api/v1/projects/:id
// @access    Private (Admin)
exports.deleteProject = asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        return next(new ErrorResponse("Project not found", 404));
    }

    await project.deleteOne();

    res.status(200).json({
        success: true,
        data: {},
    });
});
