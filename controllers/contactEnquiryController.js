const ContactEnquiry = require("../models/ContactEnquiry");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../utils/asyncHandler");

// @desc      Create a contact enquiry
// @route     POST /api/v1/contact-enquiry
// @access    Public
exports.createEnquiry = asyncHandler(async (req, res, next) => {
    const enquiry = await ContactEnquiry.create(req.body);

    res.status(201).json({
        success: true,
        data: enquiry,
    });
});

// @desc      Get all contact enquiries
// @route     GET /api/v1/contact-enquiry
// @access    Private (Admin/Staff)
exports.getEnquiries = asyncHandler(async (req, res, next) => {
    const enquiries = await ContactEnquiry.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: enquiries.length,
        data: enquiries,
    });
});

// @desc      Bulk delete contact enquiries
// @route     DELETE /api/v1/contact-enquiry/bulk-delete
// @access    Private (Admin/Staff)
exports.bulkDeleteEnquiries = asyncHandler(async (req, res, next) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return next(new ErrorResponse("Please provide an array of IDs to delete", 400));
    }

    const result = await ContactEnquiry.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
        success: true,
        message: `${result.deletedCount} enquiries deleted successfully`,
        deletedCount: result.deletedCount,
    });
});
