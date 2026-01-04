const mongoose = require("mongoose");

// Helper function to generate slug without external dependency
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

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
