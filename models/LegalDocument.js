const mongoose = require("mongoose");

const LegalDocumentSchema = new mongoose.Schema(
  {
    code: {
      en: {
        type: String,
        required: [true, "English legal document code is required"],
        trim: true,
      },
      vi: {
        type: String,
        required: [true, "Vietnamese legal document code is required"],
        trim: true,
      },
    },
    name: {
      en: {
        type: String,
        required: [true, "English legal document name is required"],
        trim: true,
      },
      vi: {
        type: String,
        required: [true, "Vietnamese legal document name is required"],
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

// ✅ Prevent duplicate codes
LegalDocumentSchema.index({ "code.en": 1 }, { unique: true });
LegalDocumentSchema.index({ "code.vi": 1 }, { unique: true });

module.exports = mongoose.model("LegalDocument", LegalDocumentSchema);
