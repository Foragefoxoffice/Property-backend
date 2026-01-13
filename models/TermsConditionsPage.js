const mongoose = require("mongoose");

const termsConditionsPageSchema = new mongoose.Schema(
    {
        termsConditionBannerTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        termsConditionBannerTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        termsConditionContentTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        termsConditionContentTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        termsConditionContent_en: {
            type: String,
            required: false,
        },
        termsConditionContent_vn: {
            type: String,
            required: false,
        },
        termsConditionBannerImage: {
            type: String,
            required: false,
        },
        // SEO Fields
        termsConditionSeoMetaTitle_en: { type: String, maxlength: 200 },
        termsConditionSeoMetaTitle_vn: { type: String, maxlength: 200 },
        termsConditionSeoMetaDescription_en: { type: String, maxlength: 500 },
        termsConditionSeoMetaDescription_vn: { type: String, maxlength: 500 },
        termsConditionSeoMetaKeywords_en: [{ type: String }],
        termsConditionSeoMetaKeywords_vn: [{ type: String }],
        termsConditionSeoSlugUrl_en: { type: String },
        termsConditionSeoSlugUrl_vn: { type: String },
        termsConditionSeoCanonicalUrl_en: { type: String },
        termsConditionSeoCanonicalUrl_vn: { type: String },
        termsConditionSeoSchemaType_en: { type: String },
        termsConditionSeoSchemaType_vn: { type: String },
        termsConditionSeoOgTitle_en: { type: String },
        termsConditionSeoOgTitle_vn: { type: String },
        termsConditionSeoOgDescription_en: { type: String },
        termsConditionSeoOgDescription_vn: { type: String },
        termsConditionSeoAllowIndexing: { type: Boolean, default: true },
        termsConditionSeoOgImages: [{ type: String }],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("TermsConditionsPage", termsConditionsPageSchema);
