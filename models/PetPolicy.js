const mongoose = require("mongoose");

const PetPolicySchema = new mongoose.Schema(
    {
        code: {
            en: { type: String, required: [true, "English code is required"], trim: true },
            vi: { type: String, required: [true, "Vietnamese code is required"], trim: true },
        },
        name: {
            en: { type: String, required: [true, "English Pet Policy name is required"], trim: true },
            vi: { type: String, required: [true, "Vietnamese Pet Policy name is required"], trim: true },
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("PetPolicy", PetPolicySchema);
