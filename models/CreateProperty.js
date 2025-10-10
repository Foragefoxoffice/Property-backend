const mongoose = require("mongoose");

// ✅ Import referenced models so Mongoose knows them
require("./Furnishing");
require("./Parking");
require("./PetPolicy");
require("./AvailabilityStatus");
require("./PropertyType");
require("./User");

const LocalizedString = {
  en: { type: String, trim: true, default: "" },
  vi: { type: String, trim: true, default: "" },
};

const NearbyAmenitySchema = new mongoose.Schema(
  {
    name: LocalizedString,
    distanceKM: { type: Number, default: 0 },
  },
  { _id: true }
);

const UtilitySchema = new mongoose.Schema(
  {
    name: LocalizedString,
    icon: { type: String, default: "" },
  },
  { _id: true }
);

const ContactPersonSchema = new mongoose.Schema(
  {
    role: { type: String, default: "" },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { _id: true }
);

const CreatePropertySchema = new mongoose.Schema(
  {
    // Listing Information
    propertyId: { type: String, unique: true, index: true },
    transactionType: { type: String, trim: true, default: "" },
    project: LocalizedString,
    title: LocalizedString,
    propertyType: { type: mongoose.Schema.Types.ObjectId, ref: "PropertyType" },

    // Address / location
    country: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    postalCode: { type: String, trim: true, default: "" },
    address: LocalizedString,
    dateListed: { type: Date, default: Date.now },
    availabilityStatus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AvailabilityStatus",
    },
    availableFrom: { type: Date },

    // Property Information
    unit: { type: String, default: "" },
    unitSize: { type: Number, default: 0 },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    floors: { type: Number, default: 1 },
    floorNumber: { type: Number, default: 0 },
    furnishing: { type: mongoose.Schema.Types.ObjectId, ref: "Furnishing" },
    yearBuilt: { type: Number, default: null },
    view: LocalizedString,
    parkingAvailability: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parking",
    },
    petPolicy: { type: mongoose.Schema.Types.ObjectId, ref: "PetPolicy" },
    whatsNearby: [NearbyAmenitySchema],
    description: LocalizedString,

    // Property Utility
    utilities: [UtilitySchema],

    // images and videos (kept as arrays; file upload handled elsewhere)
    propertyImages: [{ type: String, default: "" }],
    propertyVideos: [{ type: String, default: "" }],
    floorPlans: [{ type: String, default: "" }],

    // Financial details
    currency: { type: String, default: "USD" },
    price: { type: Number, default: 0 },
    pricePerUnit: { type: Number, default: 0 },
    contractTerms: LocalizedString,
    depositPaymentTerms: LocalizedString,
    maintenanceFeeMonthly: { type: Number, default: 0 },

    // Contact / Management Details
    owners: [ContactPersonSchema],
    propertyConsultant: ContactPersonSchema,
    internalNotes: { type: String, default: "" },

    // Misc
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CreateProperty", CreatePropertySchema);
