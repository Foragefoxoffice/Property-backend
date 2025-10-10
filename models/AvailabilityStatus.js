const mongoose = require("mongoose");

const AvailabilityStatusSchema = new mongoose.Schema(
  {
    code: {
      en: {
        type: String,
        required: [true, "English Availability Status code is required"],
        trim: true,
      },
      vi: {
        type: String,
        required: [true, "Vietnamese Availability Status code is required"],
        trim: true,
      },
    },
    name: {
      en: {
        type: String,
        required: [true, "English Availability Status name is required"],
        trim: true,
      },
      vi: {
        type: String,
        required: [true, "Vietnamese Availability Status name is required"],
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Prevent duplicate codes across languages
AvailabilityStatusSchema.index({ "code.en": 1 }, { unique: true });
AvailabilityStatusSchema.index({ "code.vi": 1 }, { unique: true });

module.exports = mongoose.model("AvailabilityStatus", AvailabilityStatusSchema);
