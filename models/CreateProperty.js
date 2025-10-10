const mongoose = require("mongoose");

const LangField = {
    en: { type: String, trim: true },
    vi: { type: String, trim: true },
};

const AmenitySchema = new mongoose.Schema({
    name: LangField,
    km: { type: String, trim: true },
});

const UtilitySchema = new mongoose.Schema({
    name: LangField,
    icon: LangField,
});

const MediaSchema = new mongoose.Schema({
    url: { type: String, required: true },
    type: { type: String, enum: ["image", "video", "floorplan"], required: true },
});

const FinancialSchema = new mongoose.Schema({
    currency: LangField,
    price: { type: String, trim: true },
    pricePerUnit: { type: String, trim: true },
    contractTerms: LangField,
    depositTerms: LangField,
    maintenanceFee: LangField,
});

const ContactSchema = new mongoose.Schema({
    ownersLandlord: LangField,
    ownerLandlordText: LangField,
    propertyConsultant: LangField,
    internalNotes: LangField,
});

const PropertySchema = new mongoose.Schema(
    {
        // 1️⃣ Listing Information
        listingInfo: {
            propertyId: { type: String, required: true, trim: true },
            transactionType: LangField,
            projectCommunity: LangField,
            zoneSubArea: LangField,
            propertyTitle: LangField,
            propertyType: LangField,
            country: LangField,
            state: LangField,
            city: LangField,
            postalCode: LangField,
            address: LangField,
            dateListed: { type: Date },
            availabilityStatus: LangField,
            availableFrom: { type: Date },
        },

        // 2️⃣ Property Information
        propertyInfo: {
            unit: LangField,
            unitSize: LangField,
            bedrooms: LangField,
            bathrooms: LangField,
            floors: LangField,
            floorNumber: LangField,
            furnishing: LangField,
            yearBuilt: { type: Date },
            view: LangField,
            parkingAvailability: LangField,
            petPolicy: LangField,
            whatsNearby: LangField,
            amenities: [AmenitySchema],
            description: LangField,
        },

        // 3️⃣ Property Utility
        utilities: [UtilitySchema],

        // 4️⃣ Media (Images, Videos, Floor Plans)
        media: [MediaSchema],

        // 5️⃣ Financial details
        financialDetails: FinancialSchema,

        // 6️⃣ Contact / Management Details
        contactManagement: ContactSchema,

        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
    },
    { timestamps: true }
);

// ✅ Auto-fill English and Vietnamese values
PropertySchema.pre("save", function (next) {
    function convertLangFields(obj) {
        if (!obj || typeof obj !== "object") return obj;
        for (const key in obj) {
            const value = obj[key];

            // If it's a simple string field, wrap into { en, vi }
            if (typeof value === "string" && !/^[0-9a-fA-F]{24}$/.test(value)) {
                obj[key] = { en: value, vi: value };
            }

            // If it's a nested object or array, go deeper
            else if (Array.isArray(value)) {
                obj[key] = value.map((v) => convertLangFields(v));
            } else if (typeof value === "object") {
                obj[key] = convertLangFields(value);
            }
        }
        return obj;
    }

    convertLangFields(this);
    next();
});


// ✅ SAFE EXPORT
module.exports =
    mongoose.models.Property || mongoose.model("Property", PropertySchema);
