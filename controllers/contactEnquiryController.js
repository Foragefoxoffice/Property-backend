const ContactEnquiry = require("../models/ContactEnquiry");
const NotificationSetting = require("../models/NotificationSetting");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../utils/asyncHandler");
const sendEmail = require("../utils/sendEmail");

// @desc      Create a contact enquiry
// @route     POST /api/v1/contact-enquiry
// @access    Public
exports.createEnquiry = asyncHandler(async (req, res, next) => {
    const enquiry = await ContactEnquiry.create(req.body);

    // Fetch Notification Settings to get the recipient email
    let settings = await NotificationSetting.findOne();
    const recipientEmail = settings ? settings.contactEnquiryEmail : process.env.SMTP_EMAIL;

    if (recipientEmail) {
        try {
            await sendEmail({
                email: recipientEmail,
                subject: `New Contact Enquiry: ${enquiry.subject}`,
                message: `
                    <h2>New Contact Enquiry Received</h2>
                    <p><strong>Name:</strong> ${enquiry.firstName} ${enquiry.lastName}</p>
                    <p><strong>Email:</strong> ${enquiry.email}</p>
                    <p><strong>Phone:</strong> ${enquiry.phone}</p>
                    <p><strong>Subject:</strong> ${enquiry.subject}</p>
                    <p><strong>Message:</strong></p>
                    <p>${enquiry.message}</p>
                `
            });
            console.log(`📧 Notification email sent to ${recipientEmail}`);
        } catch (error) {
            console.error(`❌ Failed to send notification email: ${error.message}`);
        }
    }

    // Emit Socket.IO event for real-time notification
    const io = req.app.get('io');
    if (io) {
        io.emit('newContactEnquiry', {
            enquiry,
            message: `New contact enquiry from ${enquiry.firstName} ${enquiry.lastName}`,
            timestamp: new Date()
        });
        console.log(`🔔 New contact enquiry notification sent via Socket.IO`.green);
    }

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
