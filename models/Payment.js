const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    code: {
      en: {
        type: String,
        required: [true, "English Payment code is required"],
        trim: true,
      },
      vi: {
        type: String,
        required: [true, "Vietnamese Payment code is required"],
        trim: true,
      },
    },
    name: {
      en: {
        type: String,
        required: [true, "English Payment name is required"],
        trim: true,
      },
      vi: {
        type: String,
        required: [true, "Vietnamese Payment name is required"],
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
PaymentSchema.index({ "code.en": 1 }, { unique: true });
PaymentSchema.index({ "code.vi": 1 }, { unique: true });

module.exports = mongoose.model("Payment", PaymentSchema);
