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
    staffsId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    staffsEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
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
