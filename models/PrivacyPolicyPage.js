const mongoose = require("mongoose");

const privacyPolicyPageSchema = new mongoose.Schema(
    {
        privacyPolicyBannerTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        privacyPolicyBannerTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        privacyPolicyContentTitle_en: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        privacyPolicyContentTitle_vn: {
            type: String,
            required: false,
            trim: true,
            maxlength: 200,
        },
        privacyPolicyContent_en: {
            type: String,
            required: false,
        },
        privacyPolicyContent_vn: {
            type: String,
            required: false,
        },
        privacyPolicyBannerImage: {
            type: String,
            required: false,
        },
        // SEO Fields
        privacyPolicySeoMetaTitle_en: { type: String, maxlength: 200 },
        privacyPolicySeoMetaTitle_vn: { type: String, maxlength: 200 },
        privacyPolicySeoMetaDescription_en: { type: String, maxlength: 500 },
        privacyPolicySeoMetaDescription_vn: { type: String, maxlength: 500 },
        privacyPolicySeoMetaKeywords_en: [{ type: String }],
        privacyPolicySeoMetaKeywords_vn: [{ type: String }],
        privacyPolicySeoSlugUrl_en: { type: String },
        privacyPolicySeoSlugUrl_vn: { type: String },
        privacyPolicySeoCanonicalUrl_en: { type: String },
        privacyPolicySeoCanonicalUrl_vn: { type: String },
        privacyPolicySeoSchemaType_en: { type: String },
        privacyPolicySeoSchemaType_vn: { type: String },
        privacyPolicySeoOgTitle_en: { type: String },
        privacyPolicySeoOgTitle_vn: { type: String },
        privacyPolicySeoOgDescription_en: { type: String },
        privacyPolicySeoOgDescription_vn: { type: String },
        privacyPolicySeoAllowIndexing: { type: Boolean, default: true },
        privacyPolicySeoOgImages: [{ type: String }],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("PrivacyPolicyPage", privacyPolicyPageSchema);
