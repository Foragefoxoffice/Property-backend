const mongoose = require("mongoose");

const UnitSchema = new mongoose.Schema(
    {
        code: {
            en: { type: String, required: [true, "English code is required"], trim: true },
            vi: { type: String, required: [true, "Vietnamese code is required"], trim: true },
        },
        name: {
            en: { type: String, required: [true, "English Unit name is required"], trim: true },
            vi: { type: String, required: [true, "Vietnamese Unit name is required"], trim: true },
        },
        symbol: {
            en: { type: String, required: [true, "English Unit symbol is required"], trim: true },
            vi: { type: String, required: [true, "Vietnamese Unit symbol is required"], trim: true },
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Unit", UnitSchema);
