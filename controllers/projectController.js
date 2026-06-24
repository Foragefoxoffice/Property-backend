const mongoose = require("mongoose");
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

// @desc      Get single project by ID or Slug
// @route     GET /api/v1/projects/:id
// @access    Public
exports.getProjectById = asyncHandler(async (req, res, next) => {
    const idOrSlug = req.params.id;
    const isAdmin = req.user && req.user.role && req.user.role !== 'user';
    let project;

    let query = {};
    if (!isAdmin) {
        query.published = true;
    }

    // 1. Try finding by ID if it's a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
        project = await Project.findOne({ _id: idOrSlug, ...query }).populate("category");
    }

    // 2. If not found by ID (or not a valid ID), try finding by slug
    if (!project) {
        project = await Project.findOne({
            $or: [
                { "slug.en": idOrSlug }, 
                { "slug.vi": idOrSlug },
                { "projectSeoSlugUrl_en": idOrSlug },
                { "projectSeoSlugUrl_vn": idOrSlug },
                { "projectSeoSlugUrl_vi": idOrSlug }
            ],
            ...query
        }).populate("category");
    }

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
    const isAdmin = req.user && req.user.role && req.user.role !== 'user';

    let query = {
        $or: [
            { "slug.en": slug }, 
            { "slug.vi": slug },
            { "projectSeoSlugUrl_en": slug },
            { "projectSeoSlugUrl_vn": slug },
            { "projectSeoSlugUrl_vi": slug }
        ],
    };

    if (!isAdmin) {
        query.published = true;
    }

    const project = await Project.findOne(query).populate("category");

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

    const generateSlug = require("../utils/generateSlug");
    
    // Auto-generate slug if title is updated or if manual seo slug is provided
    if (req.body.projectSeoSlugUrl_en) {
        if (!req.body.slug) req.body.slug = { ...project.slug };
        req.body.slug.en = req.body.projectSeoSlugUrl_en;
    } else if (req.body.title && req.body.title.en) {
        if (!req.body.slug) req.body.slug = { ...project.slug };
        req.body.slug.en = generateSlug(req.body.title.en);
    }

    if (req.body.projectSeoSlugUrl_vn) {
        if (!req.body.slug) req.body.slug = { ...project.slug };
        req.body.slug.vi = req.body.projectSeoSlugUrl_vn;
    } else if (req.body.title && req.body.title.vi) {
        if (!req.body.slug) req.body.slug = { ...project.slug };
        req.body.slug.vi = generateSlug(req.body.title.vi);
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
