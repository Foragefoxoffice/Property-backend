const mongoose = require("mongoose");

const BlockSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ZoneSubArea",
      required: true,
    },
    code: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
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

module.exports = mongoose.model("Block", BlockSchema);
