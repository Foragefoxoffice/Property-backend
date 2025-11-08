const mongoose = require("mongoose");

const FeeTaxSchema = new mongoose.Schema(
  {
    code: {
      en: {
        type: String,
        required: [true, "English Fee/Tax code is required"],
        trim: true,
      },
      vi: {
        type: String,
        required: [true, "Vietnamese Fee/Tax code is required"],
        trim: true,
      },
    },
    name: {
      en: {
        type: String,
        required: [true, "English Fee/Tax name is required"],
        trim: true,
      },
      vi: {
        type: String,
        required: [true, "Vietnamese Fee/Tax name is required"],
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

// ✅ Prevent duplicates
FeeTaxSchema.index({ "code.en": 1 }, { unique: true });
FeeTaxSchema.index({ "code.vi": 1 }, { unique: true });

module.exports = mongoose.model("FeeTax", FeeTaxSchema);
