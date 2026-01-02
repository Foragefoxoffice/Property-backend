const mongoose = require("mongoose");

const homePageSchema = new mongoose.Schema(
    {
        // Banner Section
        heroTitle_en: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        heroDescription_en: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        heroTitle_vn: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        heroDescription_vn: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        backgroundImage: {
            type: String,
            required: false,
        },

        // About Us Section
        homeAboutTitle_en: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        homeAboutTitle_vn: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        homeAboutDescription_en: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        homeAboutDescription_vn: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        homeAboutButtonText_en: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        homeAboutButtonText_vn: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        homeAboutButtonLink: {
            type: String,
            required: true,
            trim: true,
        },

        // About Step 1
        homeAboutStep1Title_en: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        homeAboutStep1Title_vn: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        homeAboutStep1Des_en: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        homeAboutStep1Des_vn: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },

        // About Step 2
        homeAboutStep2Title_en: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        homeAboutStep2Title_vn: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        homeAboutStep2Des_en: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        homeAboutStep2Des_vn: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },

        // About Step 3
        homeAboutStep3Title_en: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        homeAboutStep3Title_vn: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        homeAboutStep3Des_en: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        homeAboutStep3Des_vn: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },

        // Features Section
        homeFeatureTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        homeFeatureTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        homeFeatureDescription_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 1000,
        },
        homeFeatureDescription_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 1000,
        },

        // FAQ Section - Image Part
        homeFaqImageTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        homeFaqImageTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        homeFaqImageDescription_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        homeFaqImageDescription_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        homeFaqImageButtonText_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 50,
        },
        homeFaqImageButtonText_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 50,
        },
        homeFaqImageButtonLink: {
            type: String,
            required: false,
            trim: true,
        },
        homeFaqBg: {
            type: String,
            required: false,
        },

        // FAQ Section - Content Part
        homeFaqTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        homeFaqTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        homeFaqDescription_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        homeFaqDescription_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },

        // FAQ Items (Dynamic Array)
        faqs: [
            {
                header_en: {
                    type: String,
                    required: false,
                    trim: true,
                    maxlength: 200,
                },
                header_vn: {
                    type: String,
                    required: false,
                    trim: true,
                    maxlength: 200,
                },
                content_en: {
                    type: String,
                    required: false,
                    trim: true,
                    maxlength: 1000,
                },
                content_vn: {
                    type: String,
                    required: false,
                    trim: true,
                    maxlength: 1000,
                },
            },
        ],

        // Find Property Section
        homeFindTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        homeFindTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        homeFindDescription_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        homeFindDescription_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        homeFindBg: {
            type: String,
            required: false,
        },

        // Blog Section
        homeBlogTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        homeBlogTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        homeBlogDescription_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        homeBlogDescription_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },

        // SEO Section
        homeSeoMetaTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        homeSeoMetaTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        homeSeoMetaDescription_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        homeSeoMetaDescription_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        homeSeoMetaKeywords_en: {
            type: [String],
            required: false,
            default: [],
        },
        homeSeoMetaKeywords_vn: {
            type: [String],
            required: false,
            default: [],
        },
        homeSeoSlugUrl_en: {
            type: String,
            required: false,
            trim: true,
        },
        homeSeoSlugUrl_vn: {
            type: String,
            required: false,
            trim: true,
        },
        homeSeoCanonicalUrl_en: {
            type: String,
            required: false,
            trim: true,
        },
        homeSeoCanonicalUrl_vn: {
            type: String,
            required: false,
            trim: true,
        },
        homeSeoSchemaType_en: {
            type: String,
            required: false,
            trim: true,
        },
        homeSeoSchemaType_vn: {
            type: String,
            required: false,
            trim: true,
        },
        homeSeoOgTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        homeSeoOgTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        homeSeoOgDescription_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        homeSeoOgDescription_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        homeSeoAllowIndexing: {
            type: Boolean,
            required: false,
            default: true,
        },
        homeSeoOgImages: {
            type: [String],
            required: false,
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("HomePage", homePageSchema);
