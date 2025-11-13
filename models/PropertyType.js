const mongoose = require("mongoose");

const PropertyTypeSchema = new mongoose.Schema(
    {
        code: {
            en: {
                type: String,
                required: [false, "English code is required"],
                trim: true,
            },
            vi: {
                type: String,
                required: [false, "Vietnamese code is required"],
                trim: true,
            },
        },
        name: {
            en: {
                type: String,
                required: [true, "English Property Type name is required"],
                trim: true,
            },
            vi: {
                type: String,
                required: [true, "Vietnamese Property Type name is required"],
                trim: true,
            },
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("PropertyType", PropertyTypeSchema);
