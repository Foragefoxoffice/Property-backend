const ProjectEnquiry = require("../models/ProjectEnquiry");
const NotificationSetting = require('../models/NotificationSetting');
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require('../utils/sendEmail');
const { getNotificationTemplate } = require('../utils/emailTemplates');

// @desc      Create a project enquiry
// @route     POST /api/v1/project-enquiry
// @access    Public
exports.createProjectEnquiry = asyncHandler(async (req, res, next) => {
    const enquiry = await ProjectEnquiry.create(req.body);

    // Fetch Notification Settings to get the recipient email
    let settings = await NotificationSetting.findOne();
    const recipientEmail = settings ? settings.projectEnquiryEmail : process.env.SMTP_EMAIL;

    if (recipientEmail) {
        try {
            const detailsHtml = `
                <p><strong>Project:</strong> ${enquiry.projectName}</p>
                <p><strong>Full Name:</strong> ${enquiry.fullName}</p>
                <p><strong>Phone:</strong> ${enquiry.phone}</p>
                <p><strong>Message:</strong></p>
                <p>${enquiry.message || 'N/A'}</p>
            `;
            const messageTemplate = getNotificationTemplate(`New Project Enquiry: ${enquiry.projectName}`, detailsHtml);

            await sendEmail({
                email: recipientEmail,
                subject: `New Project Enquiry: ${enquiry.projectName}`,
                message: messageTemplate
            });
            console.log(`📧 Project enquiry notification email sent to ${recipientEmail}`);
        } catch (error) {
            console.error(`❌ Failed to send project enquiry notification email: ${error.message}`);
        }
    }

    // Emit Socket.IO event for real-time notification
    const io = req.app.get('io');
    if (io) {
        io.emit('newProjectEnquiry', {
            enquiry,
            message: `New project enquiry for "${enquiry.projectName}" from ${enquiry.fullName}`,
            timestamp: new Date()
        });
        console.log(`🔔 New project enquiry notification sent via Socket.IO`);
    }

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
