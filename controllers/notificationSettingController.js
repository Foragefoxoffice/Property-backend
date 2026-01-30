const NotificationSetting = require('../models/NotificationSetting');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get notification settings
// @route   GET /api/v1/notification-settings
// @access  Private/Admin
exports.getNotificationSettings = asyncHandler(async (req, res, next) => {
    let settings = await NotificationSetting.findOne();

    if (!settings) {
        // Create default settings if not exists
        settings = await NotificationSetting.create({
            contactEnquiryEmail: process.env.SMTP_EMAIL || 'admin@example.com',
            favoritesEnquiryEmail: process.env.SMTP_EMAIL || 'admin@example.com',
            propertyEnquiryEmail: process.env.SMTP_EMAIL || 'admin@example.com'
        });
    }

    res.status(200).json({
        success: true,
        data: settings
    });
});

// @desc    Update notification settings
// @route   PUT /api/v1/notification-settings
// @access  Private/Admin
exports.updateNotificationSettings = asyncHandler(async (req, res, next) => {
    let settings = await NotificationSetting.findOne();

    if (!settings) {
        settings = await NotificationSetting.create(req.body);
    } else {
        settings = await NotificationSetting.findByIdAndUpdate(settings._id, req.body, {
            new: true,
            runValidators: true
        });
    }

    res.status(200).json({
        success: true,
        data: settings
    });
});
