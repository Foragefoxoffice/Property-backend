const mongoose = require("mongoose");

// Helper function to generate slug
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

const BlogSchema = new mongoose.Schema(
  {
    title: {
      en: { type: String, required: true },
      vi: { type: String, required: true },
    },
    // The main slug for the blog URL
    slug: {
      en: { type: String, unique: true },
      vi: { type: String, unique: true },
    },
    content: {
      en: { type: String, required: true },
      vi: { type: String, required: true },
    },
    author: {
      type: String, // Can be a name or ref, keeping flexible as string for now
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    mainImage: {
      type: String,
      default: "",
    },
    tags: {
      en: [String],
      vi: [String],
    },
    published: {
      type: Boolean,
      default: true,
    },
    seoInformation: {
      metaTitle: {
        en: String,
        vi: String,
      },
      metaDescription: {
        en: String,
        vi: String,
      },
      metaKeywords: {
        en: [String],
        vi: [String],
      },
      slugUrl: {
        en: String,
        vi: String,
      },
      canonicalUrl: {
        en: String,
        vi: String,
      },
      allowIndexing: {
        en: { type: Boolean, default: true },
        vi: { type: Boolean, default: true },
      },
      schemaType: {
        en: String,
        vi: String,
      },
      ogTitle: {
        en: String,
        vi: String,
      },
      ogDescription: {
        en: String,
        vi: String,
      },
      ogImages: [String],
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure slugs exist
BlogSchema.pre("save", function (next) {
  // English Slug
  if (this.seoInformation?.slugUrl?.en) {
    this.slug.en = this.seoInformation.slugUrl.en;
  } else if (this.title.en && !this.slug.en) {
    this.slug.en = generateSlug(this.title.en);
  }

  // Vietnamese Slug
  if (this.seoInformation?.slugUrl?.vi) {
    this.slug.vi = this.seoInformation.slugUrl.vi;
  } else if (this.title.vi && !this.slug.vi) {
    this.slug.vi = generateSlug(this.title.vi);
  }

  next();
});

module.exports = mongoose.model("Blog", BlogSchema);
