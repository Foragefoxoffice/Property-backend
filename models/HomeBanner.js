const mongoose = require("mongoose");

const homeBannerSchema = new mongoose.Schema(
    {
        // English Content
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
        buttonText_en: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },

        // Vietnamese Content
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
        buttonText_vn: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },

        // Common Fields
        buttonLink: {
            type: String,
            required: true,
            trim: true,
        },
        backgroundImage: {
            type: String,
            required: false, // Optional - can be uploaded later
        },
        backgroundVideo: {
            type: String,
            required: false, // Optional - alternative to image
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
homeBannerSchema.index({ isActive: 1, displayOrder: 1 });

module.exports = mongoose.model("HomeBanner", homeBannerSchema);
