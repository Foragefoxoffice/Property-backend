const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
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

// ❌ REMOVE unique indexes
// PaymentSchema.index({ "code.en": 1 }, { unique: true });
// PaymentSchema.index({ "code.vi": 1 }, { unique: true });

module.exports = mongoose.model("Payment", PaymentSchema);
