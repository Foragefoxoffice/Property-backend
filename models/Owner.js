const mongoose = require("mongoose");

const OwnerSchema = new mongoose.Schema(
  {
    ownerName: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },
    ownerType: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },
    ownerNumber: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },
    ownerFacebook: {
      en: { type: String, trim: true },
      vi: { type: String, trim: true },
    },
    ownerNotes: {
      en: { type: String, trim: true },
      vi: { type: String, trim: true },
    },
    photo: {
      type: String, // URL of uploaded image
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Owner", OwnerSchema);
