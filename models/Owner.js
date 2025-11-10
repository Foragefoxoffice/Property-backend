const mongoose = require("mongoose");

const OwnerSchema = new mongoose.Schema(
  {
    ownerName: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    // ✅ FINAL phone structure (one language)
    phoneNumbers: [{ type: String, trim: true }],

    // ✅ Emails
    emailAddresses: [{ type: String, trim: true }],

    // ✅ Social Media arrays
    socialMedia_iconName: [{ type: String, trim: true }],
    socialMedia_link_en: [{ type: String, trim: true }],
    socialMedia_link_vi: [{ type: String, trim: true }],

    ownerNotes: {
      en: { type: String, trim: true },
      vi: { type: String, trim: true },
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
