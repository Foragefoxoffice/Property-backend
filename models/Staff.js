const mongoose = require("mongoose");

const StaffSchema = new mongoose.Schema(
  {
    staffsImage: {
      type: String,
      default: null,
    },

    staffsName: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },

    staffsEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
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

    /** ✅ Multiple Phone Numbers */
    staffsNumbers: {
      type: [String],
      default: [],
    },

    /** ✅ Gender */
    staffsGender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
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
