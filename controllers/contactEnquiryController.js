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
