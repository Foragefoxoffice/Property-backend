const mongoose = require("mongoose");

const FloorRangeSchema = new mongoose.Schema(
  {
    code: {
      en: {
        type: String,
        required: [false, "English Floor Range code is required"],
        trim: true,
      },
      vi: {
        type: String,
        required: [false, "Vietnamese Floor Range code is required"],
        trim: true,
      },
    },
    name: {
      en: {
        type: String,
        required: [true, "English Floor Range name is required"],
        trim: true,
      },
      vi: {
        type: String,
        required: [true, "Vietnamese Floor Range name is required"],
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
FloorRangeSchema.index({ "code.en": 1 }, { unique: true });
FloorRangeSchema.index({ "code.vi": 1 }, { unique: true });

module.exports = mongoose.model("FloorRange", FloorRangeSchema);
