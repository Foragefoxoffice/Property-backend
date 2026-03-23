const mongoose = require("mongoose");

const blogPageSchema = new mongoose.Schema(
    {
        // Banner Section
        blogTitle: {
            en: {
                type: String,
                required: false,
                trim: true,
                maxlength: 200,
            },
            vi: {
                type: String,
                required: false,
                trim: true,
                maxlength: 200,
            },
        },
        blogDescription: {
            en: {
                type: String,
                required: false,
                trim: true,
                maxlength: 500,
            },
            vi: {
                type: String,
                required: false,
                trim: true,
                maxlength: 500,
            },
        },
        blogBannerbg: {
            type: String,
            required: false,
        },

        // SEO Section
        blogSeoMetaTitle_en: { type: String, trim: true, maxlength: 200 },
        blogSeoMetaTitle_vn: { type: String, trim: true, maxlength: 200 },
        blogSeoMetaDescription_en: { type: String, trim: true, maxlength: 500 },
        blogSeoMetaDescription_vn: { type: String, trim: true, maxlength: 500 },
        blogSeoMetaKeywords_en: [{ type: String }],
        blogSeoMetaKeywords_vn: [{ type: String }],
        blogSeoSlugUrl_en: { type: String, trim: true },
        blogSeoSlugUrl_vn: { type: String, trim: true },
        blogSeoCanonicalUrl_en: { type: String, trim: true },
        blogSeoCanonicalUrl_vn: { type: String, trim: true },
        blogSeoSchemaType_en: { type: String, trim: true },
        blogSeoSchemaType_vn: { type: String, trim: true },
        blogSeoOgTitle_en: { type: String, trim: true },
        blogSeoOgTitle_vn: { type: String, trim: true },
        blogSeoOgDescription_en: { type: String, trim: true },
        blogSeoOgDescription_vn: { type: String, trim: true },
        blogSeoAllowIndexing: { type: Boolean, default: true },
        blogSeoOgImage: { type: String, default: '' },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("BlogPage", blogPageSchema);
