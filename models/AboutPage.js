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

        // Overview Section
        aboutOverviewTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutOverviewTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutOverviewDescription_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 1000,
        },
        aboutOverviewDescription_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 1000,
        },
        aboutOverviewBg: {
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

        // Agent Section
        aboutAgentTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutAgentTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutAgentSubTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutAgentSubTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutAgentDescription_en: {
            type: String,
            required: false,
            trim: true,
        },
        aboutAgentDescription_vn: {
            type: String,
            required: false,
            trim: true,
        },
        aboutAgentContent_en: {
            type: String,
            required: false,
            trim: true,
        },
        aboutAgentContent_vn: {
            type: String,
            required: false,
            trim: true,
        },
        aboutAgentButtonText_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 50,
        },
        aboutAgentButtonText_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 50,
        },
        aboutAgentButtonLink: {
            type: String,
            required: false,
            trim: true,
        },
        aboutAgentImage: {
            type: String,
            required: false,
        },

        // Find Property Section
        aboutFindTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutFindTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutFindDescription_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        aboutFindDescription_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        aboutFindBg: {
            type: String,
            required: false,
        },

        // SEO Section
        aboutSeoMetaTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutSeoMetaTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutSeoMetaDescription_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        aboutSeoMetaDescription_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        aboutSeoMetaKeywords_en: {
            type: [String],
            required: false,
        },
        aboutSeoMetaKeywords_vn: {
            type: [String],
            required: false,
        },
        aboutSeoSlugUrl_en: {
            type: String,
            required: false,
            trim: true,
        },
        aboutSeoSlugUrl_vn: {
            type: String,
            required: false,
            trim: true,
        },
        aboutSeoCanonicalUrl_en: {
            type: String,
            required: false,
            trim: true,
        },
        aboutSeoCanonicalUrl_vn: {
            type: String,
            required: false,
            trim: true,
        },
        aboutSeoSchemaType_en: {
            type: String,
            required: false,
            trim: true,
        },
        aboutSeoSchemaType_vn: {
            type: String,
            required: false,
            trim: true,
        },
        aboutSeoOgTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutSeoOgTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        aboutSeoOgDescription_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        aboutSeoOgDescription_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        aboutSeoAllowIndexing: {
            type: Boolean,
            required: false,
            default: true,
        },
        aboutSeoOgImages: {
            type: [String],
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("AboutPage", aboutPageSchema);
