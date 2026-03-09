const mongoose = require("mongoose");

const projectBannerSchema = new mongoose.Schema(
    {
        // Banner Title (Multi-language)
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

        // Banner Description (Multi-language)
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

        // Banner Images (Multi-upload - array of image URLs)
        projectBannerImages: {
            type: [String],
            required: false,
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("ProjectBanner", projectBannerSchema);
