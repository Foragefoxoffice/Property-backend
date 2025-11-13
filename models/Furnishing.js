// models/Furnishing.js
const mongoose = require("mongoose");

const FurnishingSchema = new mongoose.Schema(
  {
    code: {
      en: { type: String, trim: true },
      vi: { type: String, trim: true },
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Furnishing", FurnishingSchema);
