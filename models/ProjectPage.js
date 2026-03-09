const mongoose = require("mongoose");

const projectPageSchema = new mongoose.Schema(
    {
        // Banner Section (Multi-language)
        projectBannerTitle: {
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
        projectBannerDesc: {
            en: {
                type: String,
                required: false,
                trim: true,
                maxlength: 1000,
            },
            vi: {
                type: String,
                required: false,
                trim: true,
                maxlength: 1000,
            },
        },
        projectBannerImages: {
            type: [String],
            required: false,
            default: [],
        },

        // Overview Section (Multi-language)
        projectOverviewContent: {
            en: {
                type: String,
                required: false,
                trim: true,
            },
            vi: {
                type: String,
                required: false,
                trim: true,
            },
        },
        mediaType: {
            type: String,
            enum: ['image', 'youtube'],
            default: 'image',
        },
        projectOverviewVideo: {
            type: String,
            required: false,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("ProjectPage", projectPageSchema);
