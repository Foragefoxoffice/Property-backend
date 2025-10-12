const mongoose = require("mongoose");

const CurrencySchema = new mongoose.Schema(
  {
    currencyCode: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },
    currencyName: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },
    currencySymbol: {
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

module.exports = mongoose.model("Currency", CurrencySchema);
