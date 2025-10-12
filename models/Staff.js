const mongoose = require("mongoose");

const StaffSchema = new mongoose.Schema(
  {
    staffsImage: {
      type: String, // Base64 or URL
      default: null,
    },
    staffsName: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },
    staffsId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    staffsRole: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },
    staffsNumber: {
      type: String,
      required: true,
      trim: true,
    },
    staffsNotes: {
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

module.exports = mongoose.model("Staff", StaffSchema);
