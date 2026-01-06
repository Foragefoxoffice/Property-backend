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
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("BlogPage", blogPageSchema);
