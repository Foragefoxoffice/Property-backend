const mongoose = require("mongoose");

const projectPageSchema = new mongoose.Schema(
    {
        // Banner Section
        projectBannerTitle: {
            en: { type: String, required: false, trim: true },
            vi: { type: String, required: false, trim: true },
        },
        projectBannerDesc: {
            en: { type: String, required: false, trim: true },
            vi: { type: String, required: false, trim: true },
        },
        projectBannerImages: {
            type: [String],
            default: [],
        },
        // Intro Section
        projectIntroTitle: {
            en: { type: String, required: false, trim: true },
            vi: { type: String, required: false, trim: true },
        },
        projectIntroContent: {
            en: { type: String, required: false, trim: true },
            vi: { type: String, required: false, trim: true },
        },
        // Related Projects Section
        relatedProjectTitle: {
            en: { type: String, required: false, trim: true },
            vi: { type: String, required: false, trim: true },
        },

        // SEO Section
        projectSeoMetaTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        projectSeoMetaTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        projectSeoMetaDescription_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        projectSeoMetaDescription_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        projectSeoMetaKeywords_en: {
            type: [String],
            required: false,
            default: [],
        },
        projectSeoMetaKeywords_vn: {
            type: [String],
            required: false,
            default: [],
        },
        projectSeoSlugUrl_en: {
            type: String,
            required: false,
            trim: true,
        },
        projectSeoSlugUrl_vn: {
            type: String,
            required: false,
            trim: true,
        },
        projectSeoCanonicalUrl_en: {
            type: String,
            required: false,
            trim: true,
        },
        projectSeoCanonicalUrl_vn: {
            type: String,
            required: false,
            trim: true,
        },
        projectSeoSchemaType_en: {
            type: String,
            required: false,
            trim: true,
        },
        projectSeoSchemaType_vn: {
            type: String,
            required: false,
            trim: true,
        },
        projectSeoOgTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        projectSeoOgTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        projectSeoOgDescription_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        projectSeoOgDescription_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        projectSeoAllowIndexing: {
            type: Boolean,
            required: false,
            default: true,
        },
        projectSeoOgImage: {
            type: String,
            required: false,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("ProjectPage", projectPageSchema);
