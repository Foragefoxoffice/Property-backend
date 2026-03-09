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
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("ProjectPage", projectPageSchema);
