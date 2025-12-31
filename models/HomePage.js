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
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("HomePage", homePageSchema);
