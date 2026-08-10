const mongoose = require("mongoose");

const SalesAgentFeeSchema = new mongoose.Schema(
  {
    code: {
      en: {
        type: String,
        required: [false, "English Sales Agent Fee code is required"],
        trim: true,
      },
      vi: {
        type: String,
        required: [false, "Vietnamese Sales Agent Fee code is required"],
        trim: true,
      },
    },
    name: {
      en: {
        type: String,
        required: [true, "English Sales Agent Fee name is required"],
        trim: true,
      },
      vi: {
        type: String,
        required: [true, "Vietnamese Sales Agent Fee name is required"],
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

// Prevent duplicates
SalesAgentFeeSchema.index({ "code.en": 1 }, { unique: true });
SalesAgentFeeSchema.index({ "code.vi": 1 }, { unique: true });

module.exports = mongoose.model("SalesAgentFee", SalesAgentFeeSchema);
