const mongoose = require("mongoose");

const generateSlug = require("../utils/generateSlug");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      en: {
        type: String,
        required: [true, "Please provide category name in English"],
        trim: true,
      },
      vi: {
        type: String,
        required: [true, "Please provide category name in Vietnamese"],
        trim: true,
      },
    },
    slug: {
      en: {
        type: String,
        unique: true,
      },
      vi: {
        type: String,
        unique: true,
      },
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slugs before saving
CategorySchema.pre("save", function (next) {
  if (this.name.en) {
    this.slug.en = generateSlug(this.name.en);
  }
  if (this.name.vi) {
    this.slug.vi = generateSlug(this.name.vi);
  }
  next();
});

module.exports = mongoose.model("Category", CategorySchema);
