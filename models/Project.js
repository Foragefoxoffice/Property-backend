const mongoose = require("mongoose");

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

const projectSchema = new mongoose.Schema(
    {
        // Core Fields
        title: {
            en: { type: String, required: true },
            vi: { type: String, required: true },
        },
        slug: {
            en: { type: String, unique: true },
            vi: { type: String, unique: true },
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProjectCategory",
            required: true,
        },
        published: {
            type: Boolean,
            default: true,
        },
        mainImage: {
            type: String,
            default: "",
        },

        // Banner Section (Multi-language)
        projectBannerTitle: {
            en: { type: String, required: false, trim: true, maxlength: 200 },
            vi: { type: String, required: false, trim: true, maxlength: 200 },
        },
        projectBannerDesc: {
            en: { type: String, required: false, trim: true, maxlength: 1000 },
            vi: { type: String, required: false, trim: true, maxlength: 1000 },
        },
        projectBannerImages: {
            type: [String],
            required: false,
            default: [],
        },

        // Intro Section (Multi-language)
        projectIntroContent: {
            en: { type: String, required: false, trim: true },
            vi: { type: String, required: false, trim: true },
        },
        mediaType: {
            type: String,
            enum: ['image', 'youtube'],
            default: 'image',
        },
        projectIntroVideo: {
            type: String,
            required: false,
            trim: true,
        },

        // Overview Section (Multi-language)
        projectOverviewTitle: {
            en: { type: String, required: false, trim: true },
            vi: { type: String, required: false, trim: true },
        },
        projectOverviewImages: [
            {
                url: { type: String, required: false },
                description: {
                    en: { type: String, required: false, trim: true },
                    vi: { type: String, required: false, trim: true },
                },
            },
        ],
        projectOverviewTable: [
            {
                head: {
                    en: { type: String, required: false, trim: true },
                    vi: { type: String, required: false, trim: true },
                },
                des: {
                    en: { type: String, required: false, trim: true },
                    vi: { type: String, required: false, trim: true },
                },
            },
        ],
        projectLocationTitle: {
            en: { type: String, required: false, trim: true },
            vi: { type: String, required: false, trim: true },
        },
        projectLocationDes: {
            en: { type: String, required: false },
            vi: { type: String, required: false },
        },
        projectLocationImages: {
            type: [String],
            required: false,
            default: [],
        },
        projectPhotoTitle: {
            en: { type: String, required: false },
            vi: { type: String, required: false },
        },
        projectPhotoTabs: [
            {
                tabTitle: {
                    en: { type: String, required: false },
                    vi: { type: String, required: false },
                },
                images: [
                    {
                        url: { type: String, required: false },
                        description: {
                            en: { type: String, required: false },
                            vi: { type: String, required: false },
                        },
                    },
                ],
            },
        ],

        // Product Section (Multi-language)
        projectProductTitle: {
            en: { type: String, required: false },
            vi: { type: String, required: false },
        },
        projectProductDes: {
            en: { type: String, required: false },
            vi: { type: String, required: false },
        },
        projectProducts: [
            {
                projectProductProductTitle: {
                    en: { type: String, required: false },
                    vi: { type: String, required: false },
                },
                projectProductProducDes: {
                    en: { type: String, required: false },
                    vi: { type: String, required: false },
                },
                projectProductProductImage: {
                    type: String,
                    required: false,
                },
            },
        ],

        // Video Section (Multi-language)
        projectVideoTitle: {
            en: { type: String, required: false },
            vi: { type: String, required: false },
        },
        projectVideoTabs: [
            {
                projectVideoTabTitle: {
                    en: { type: String, required: false },
                    vi: { type: String, required: false },
                },
                videos: [
                    {
                        projectVideoEmbeded: { type: String, required: false },
                    },
                ],
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to ensure slugs exist
projectSchema.pre("save", function (next) {
    if (this.title.en && !this.slug.en) {
        this.slug.en = generateSlug(this.title.en);
    }
    if (this.title.vi && !this.slug.vi) {
        this.slug.vi = generateSlug(this.title.vi);
    }
    next();
});

module.exports = mongoose.model("Project", projectSchema);
