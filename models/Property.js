const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema(
    {
        code: {
            en: { type: String, required: true, trim: true },
            vi: { type: String, required: true, trim: true },
        },
        name: {
            en: { type: String, required: true, trim: true },
            vi: { type: String, required: true, trim: true },
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },

        // ✅ NEW FIELDS
        blocks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Block" }],
        zones: [{ type: mongoose.Schema.Types.ObjectId, ref: "ZoneSubArea" }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Property", PropertySchema);
