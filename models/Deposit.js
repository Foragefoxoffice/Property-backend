const mongoose = require("mongoose");

const DepositSchema = new mongoose.Schema(
  {
    code: {
      en: {
        type: String,
        required: [false, "English Deposit code is required"],
        trim: true,
      },
      vi: {
        type: String,
        required: [false, "Vietnamese Deposit code is required"],
        trim: true,
      },
    },
    name: {
      en: {
        type: String,
        required: [true, "English Deposit name is required"],
        trim: true,
      },
      vi: {
        type: String,
        required: [true, "Vietnamese Deposit name is required"],
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

// ✅ Prevent duplicate codes across languages
DepositSchema.index({ "code.en": 1 }, { unique: true });
DepositSchema.index({ "code.vi": 1 }, { unique: true });

module.exports = mongoose.model("Deposit", DepositSchema);
