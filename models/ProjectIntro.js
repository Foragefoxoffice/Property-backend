const mongoose = require("mongoose");

const projectIntroSchema = new mongoose.Schema(
    {
        // Overview Content (Multi-language, Rich Text)
        projectIntroContent: {
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
        projectIntroVideo: {
            type: String,
            required: false,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("ProjectIntro", projectIntroSchema);
