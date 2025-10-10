// models/Furnishing.js
const mongoose = require("mongoose");

const LocalizedString = {
  en: { type: String, trim: true, default: "" },
  vi: { type: String, trim: true, default: "" },
};

const FurnishingSchema = new mongoose.Schema(
  {
    name: LocalizedString,
    description: LocalizedString,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Furnishing", FurnishingSchema);
