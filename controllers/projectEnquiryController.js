const ProjectEnquiry = require("../models/ProjectEnquiry");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// @desc      Create a project enquiry
// @route     POST /api/v1/project-enquiry
// @access    Public
exports.createProjectEnquiry = asyncHandler(async (req, res, next) => {
    const enquiry = await ProjectEnquiry.create(req.body);

    res.status(201).json({
        success: true,
        data: enquiry,
    });
});

// @desc      Get all project enquiries
// @route     GET /api/v1/project-enquiry
// @access    Private
exports.getProjectEnquiries = asyncHandler(async (req, res, next) => {
    const enquiries = await ProjectEnquiry.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: enquiries.length,
        data: enquiries,
    });
});

// @desc      Delete project enquiries (bulk or single)
// @route     DELETE /api/v1/project-enquiry
// @access    Private
exports.deleteProjectEnquiry = asyncHandler(async (req, res, next) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return next(new ErrorResponse("Please provide an array of IDs to delete", 400));
    }

    await ProjectEnquiry.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
        success: true,
        message: "Deleted successfully",
    });
});
