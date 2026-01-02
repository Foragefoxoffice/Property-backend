const mongoose = require("mongoose");

const contactPageSchema = new mongoose.Schema(
    {
        // Banner Section
        contactBannerTitle_en: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        contactBannerTitle_vn: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        contactBannerBg: {
            type: String,
            required: false,
        },

        // Reach Out Section
        contactReachOutTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        contactReachOutTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        contactReachOutDescription_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 1000,
        },
        contactReachOutDescription_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 1000,
        },
        contactReachOutAddressHead_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 100,
        },
        contactReachOutAddressHead_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 100,
        },
        contactReachOutAddressContent_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        contactReachOutAddressContent_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        contactReachOutNumberHead_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 100,
        },
        contactReachOutNumberHead_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 100,
        },
        contactReachOutNumberContent: {
            type: String,
            required: false,
            trim: true,
            maxlength: 100,
        },
        contactReachOutEmailHead_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 100,
        },
        contactReachOutEmailHead_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 100,
        },
        contactReachOutEmailContent: {
            type: String,
            required: false,
            trim: true,
            maxlength: 100,
        },
        contactReachOutFollowTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 100,
        },
        contactReachOutFollowTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 100,
        },

        // Social Media Icons (Dynamic Array)
        contactReachOutSocialIcons: [
            {
                icon: {
                    type: String,
                    required: false,
                    trim: true,
                },
                link: {
                    type: String,
                    required: false,
                    trim: true,
                },
            },
        ],

        contactReachOutGetinTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        contactReachOutGetinTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        contactReachOutGetinDescription_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 1000,
        },
        contactReachOutGetinDescription_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 1000,
        },

        // Map Section
        contactMapIframe: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("ContactPage", contactPageSchema);
