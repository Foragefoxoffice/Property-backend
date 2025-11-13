const mongoose = require("mongoose");

const UnitSchema = new mongoose.Schema(
  {
    code: {
      en: { type: String, required: false, trim: true },
      vi: { type: String, required: false, trim: true },
    },
    name: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },
    symbol: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Unit", UnitSchema);
