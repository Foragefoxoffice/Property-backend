const mongoose = require("mongoose");

const aboutPageSchema = new mongoose.Schema(
    {
        // Banner Section
        aboutBannerTitle_en: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        aboutBannerTitle_vn: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        aboutBannerBg: {
            type: String,
            required: false,
        },

        // History Section
        aboutHistoryTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutHistoryTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutHistoryDescription_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 1000,
        },
        aboutHistoryDescription_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 1000,
        },

        // History Timeline (Dynamic Array)
        aboutHistoryTimeline: [
            {
                date: {
                    type: String,
                    required: false,
                    trim: true,
                },
                title_en: {
                    type: String,
                    required: false,
                    trim: true,
                    maxlength: 200,
                },
                title_vn: {
                    type: String,
                    required: false,
                    trim: true,
                    maxlength: 200,
                },
                description_en: {
                    type: String,
                    required: false,
                    trim: true,
                    maxlength: 500,
                },
                description_vn: {
                    type: String,
                    required: false,
                    trim: true,
                    maxlength: 500,
                },
            },
        ],

        // Buying/Process Section
        aboutBuyingTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutBuyingTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutBuyingDescription_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 1000,
        },
        aboutBuyingDescription_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 1000,
        },

        // Buying Steps (Dynamic Array)
        aboutBuyingSteps: [
            {
                title_en: {
                    type: String,
                    required: false,
                    trim: true,
                    maxlength: 200,
                },
                title_vn: {
                    type: String,
                    required: false,
                    trim: true,
                    maxlength: 200,
                },
                description_en: {
                    type: String,
                    required: false,
                    trim: true,
                    maxlength: 500,
                },
                description_vn: {
                    type: String,
                    required: false,
                    trim: true,
                    maxlength: 500,
                },
                image: {
                    type: String,
                    required: false,
                },
            },
        ],

        // Why Choose Us Section
        aboutWhyChooseTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutWhyChooseTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutWhyChooseDescription_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 1000,
        },
        aboutWhyChooseDescription_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 1000,
        },
        aboutWhyChooseButtonText_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 50,
        },
        aboutWhyChooseButtonText_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 50,
        },
        aboutWhyChooseButtonLink: {
            type: String,
            required: false,
            trim: true,
        },

        // Why Choose Boxes (Dynamic Array)
        aboutWhyChooseBoxes: [
            {
                icon: {
                    type: String,
                    required: false,
                    trim: true,
                },
                title_en: {
                    type: String,
                    required: false,
                    trim: true,
                    maxlength: 200,
                },
                title_vn: {
                    type: String,
                    required: false,
                    trim: true,
                    maxlength: 200,
                },
                description_en: {
                    type: String,
                    required: false,
                    trim: true,
                    maxlength: 500,
                },
                description_vn: {
                    type: String,
                    required: false,
                    trim: true,
                    maxlength: 500,
                },
            },
        ],

        // Vision & Mission Section
        aboutVisionTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutVisionTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutVisionDescription_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 1000,
        },
        aboutVisionDescription_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 1000,
        },
        aboutMissionTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutMissionTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutMissionDescription_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 1000,
        },
        aboutMissionDescription_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 1000,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("AboutPage", aboutPageSchema);
