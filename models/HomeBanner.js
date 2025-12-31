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

        // Background Image
        backgroundImage: {
            type: String,
            required: false, // Optional - can be uploaded later
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("HomeBanner", homeBannerSchema);
