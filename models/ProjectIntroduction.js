const mongoose = require("mongoose");

const projectOverviewSchema = new mongoose.Schema(
    {
        // Overview Content (Multi-language, Rich Text)
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

        // Video / Image Media Type ('image' or 'youtube')
        mediaType: {
            type: String,
            enum: ['image', 'youtube'],
            default: 'image',
        },

        // Image URL or Youtube Embed URL
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

module.exports = mongoose.model("ProjectOverview", projectOverviewSchema);
