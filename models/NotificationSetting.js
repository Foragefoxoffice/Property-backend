const mongoose = require('mongoose');

const notificationSettingSchema = new mongoose.Schema({
    contactEnquiryEmail: {
        type: String,
        required: [true, 'Please add an email for contact enquiries'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    favoritesEnquiryEmail: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    propertyEnquiryEmail: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    }
}, { timestamps: true });

module.exports = mongoose.model('NotificationSetting', notificationSettingSchema);
