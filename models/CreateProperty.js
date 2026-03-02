const mongoose = require("mongoose");
require("./User");
require("./PropertyType");
require("./AvailabilityStatus");
require("./Furnishing");
require("./Parking");
require("./PetPolicy");

/* =========================================================
   🌍 Localized Field Schema
   Allows both { en, vi } and ignores extra nested issues
========================================================= */
const LocalizedString = new mongoose.Schema(
  {
    en: { type: String, trim: true, default: "" },
    vi: { type: String, trim: true, default: "" },
  },
  { _id: false, strict: false }
);

/* =========================================================
   📍 Subschemas
========================================================= */
const UtilitySchema = new mongoose.Schema(
  {
    propertyUtilityUnitName: LocalizedString,
    propertyUtilityIcon: { type: String, default: "" },
  },
  { _id: true }
);

/* =========================================================
   🏗️ Main Property Schema
========================================================= */
const CreatePropertySchema = new mongoose.Schema(
  {
    /* 🏷️ 1. Listing Information */
    listingInformation: {
      listingInformationPropertyId: { type: String, unique: true },
      listingInformationPropertyNo: LocalizedString,
      listingInformationTransactionType: LocalizedString,
      listingInformationProjectCommunity: LocalizedString,
      listingInformationZoneSubArea: LocalizedString,
      listingInformationPropertyTitle: LocalizedString,
      listingInformationBlockName: LocalizedString,
      listingInformationPropertyType: LocalizedString,
      listingInformationDateListed: { type: Date, default: Date.now },
      listingInformationAvailabilityStatus: LocalizedString,
      listingInformationAvailableFrom: { type: Date },
      listingInformationGoogleMapsIframe: LocalizedString, // ✅ Added
    },

    /* 🧱 2. Property Information */
    propertyInformation: {
      informationUnit: LocalizedString,
      informationUnitSize: { type: Number, default: 0 },
      informationBedrooms: { type: Number, default: 0 },
      informationBathrooms: { type: Number, default: 0 },
      informationFloors: {
        type: mongoose.Schema.Types.Mixed, // ✅ allows number or text
        default: 1,
      },
      informationFurnishing: LocalizedString,
      informationView: LocalizedString,
    },

    /* 📍 3. What’s Nearby */
    whatNearby: {
      whatNearbyDescription: LocalizedString,
    },

    /* ⚙️ 4. Property Utility */
    propertyUtility: [UtilitySchema],

    /* 🖼️ 5. Images / Videos */
    imagesVideos: {
      propertyImages: [{ type: String, default: "" }],
      propertyVideo: [{ type: String, default: "" }],
      floorPlan: [{ type: String, default: "" }],
    },

    /* 💰 6. Financial Details */
    financialDetails: {
      financialDetailsCurrency: { type: String, default: "USD" },
      financialDetailsPrice: { type: Number, default: 0 },
      financialDetailsTerms: LocalizedString,
      financialDetailsDeposit: LocalizedString,
      financialDetailsMainFee: LocalizedString,
      financialDetailsLeasePrice: { type: Number, default: 0 },
      financialDetailsContractLength: LocalizedString,
      financialDetailsPricePerNight: { type: Number, default: 0 },
      financialDetailsCheckIn: { type: String, trim: true, default: "" },
      financialDetailsCheckOut: { type: String, trim: true, default: "" },
      financialDetailsAgentFee: { type: Number, default: 0 },
      financialDetailsAgentPaymentAgenda: LocalizedString,
      financialDetailsFeeTax: LocalizedString,
      financialDetailsLegalDoc: LocalizedString,
    },

    /* 👤 7. Contact / Management */
    contactManagement: {
      contactManagementOwner: LocalizedString,
      contactManagementOwnerPhone: [{ type: String, trim: true }],
      contactManagementOwnerNotes: LocalizedString,
      contactManagementConsultant: LocalizedString,
      contactManagementConnectingPoint: LocalizedString,
      contactManagementConnectingPointNotes: LocalizedString,
      contactManagementInternalNotes: LocalizedString,
      contactManagementSource: LocalizedString,
      contactManagementAgentFee: { type: Number, default: 0 },
    },

    /* 👁️ Visibility Settings */
    listingInformationVisibility: {
      transactionType: { type: Boolean, default: false },
      propertyId: { type: Boolean, default: false },
      projectCommunity: { type: Boolean, default: false },
      areaZone: { type: Boolean, default: false },
      blockName: { type: Boolean, default: false },
      propertyNo: { type: Boolean, default: false },
      dateListed: { type: Boolean, default: false },
      availableFrom: { type: Boolean, default: false },
      availabilityStatus: { type: Boolean, default: false },
      googleMap: { type: Boolean, default: false }, // ✅ Added for map
    },

    propertyInformationVisibility: {
      unit: { type: Boolean, default: false },
      unitSize: { type: Boolean, default: false },
      bedrooms: { type: Boolean, default: false },
      bathrooms: { type: Boolean, default: false },
      floorRange: { type: Boolean, default: false },
      furnishing: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
    },

    titleVisibility: { type: Boolean, default: false },
    descriptionVisibility: { type: Boolean, default: false },
    whatNearbyVisibility: { type: Boolean, default: false },
    propertyUtilityVisibility: { type: Boolean, default: false },
    videoVisibility: { type: Boolean, default: false },
    floorImageVisibility: { type: Boolean, default: false },
    financialVisibility: {
      contractLength: { type: Boolean, default: false },
      deposit: { type: Boolean, default: false },
      paymentTerm: { type: Boolean, default: false },
      feeTaxes: { type: Boolean, default: false },
      legalDocs: { type: Boolean, default: false },
      agentFee: { type: Boolean, default: false },
      checkIn: { type: Boolean, default: false },
      checkOut: { type: Boolean, default: false },
    },

    /* 🔍 New Flat SEO Information */
    seo: {
      focusKeyword: { type: String, default: "" },
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      slug: { type: String, default: "" },
      canonicalUrl: { type: String, default: "" },
      noIndex: { type: Boolean, default: false }
    },

    /* 🔍 SEO Information */
    seoInformation: {
      metaTitle: LocalizedString,
      metaDescription: LocalizedString,
      metaKeywords: {
        en: [String],
        vi: [String],
      },
      slugUrl: LocalizedString,
      canonicalUrl: LocalizedString,
      schemaType: LocalizedString,
      allowIndexing: { type: Boolean, default: true },
      ogTitle: LocalizedString,
      ogDescription: LocalizedString,
      ogImages: [String],
    },

    /* 🧩 Meta */
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdByName: { type: String, default: "" }, // Stores snapshot of creator name
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedByName: { type: String, default: "" }, // Stores snapshot of approver name
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sentByName: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived", "Pending"],
      default: "Draft",
    },
  },
  { timestamps: true }
);

/* =========================================================
   📌 INDEXES
========================================================= */
CreatePropertySchema.index({ createdAt: -1 });
CreatePropertySchema.index({ status: 1 });
CreatePropertySchema.index({ "listingInformation.listingInformationTransactionType.en": 1 });
CreatePropertySchema.index({ "listingInformation.listingInformationTransactionType.vi": 1 });
CreatePropertySchema.index({ "listingInformation.listingInformationPropertyId": 1 });
CreatePropertySchema.index({ "listingInformation.listingInformationPropertyNo.en": 1 });
CreatePropertySchema.index({ "listingInformation.listingInformationPropertyNo.vi": 1 });
CreatePropertySchema.index({ "listingInformation.listingInformationPropertyType.en": 1 });
CreatePropertySchema.index({ "listingInformation.listingInformationPropertyType.vi": 1 });
CreatePropertySchema.index({ "listingInformation.listingInformationBlockName.en": 1 });
CreatePropertySchema.index({ "listingInformation.listingInformationBlockName.vi": 1 });

// 🔥 Combo index for FASTEST filtering
CreatePropertySchema.index({
  status: 1,
  "listingInformation.listingInformationTransactionType.en": 1,
  createdAt: -1
});

// ⚡ Additional indexes for listing page filters
CreatePropertySchema.index({ "propertyInformation.informationBedrooms": 1 });
CreatePropertySchema.index({ "propertyInformation.informationBathrooms": 1 });
CreatePropertySchema.index({ "financialDetails.financialDetailsPrice": 1 });
CreatePropertySchema.index({ "financialDetails.financialDetailsLeasePrice": 1 });
CreatePropertySchema.index({ "propertyInformation.informationUnitSize": 1 });
CreatePropertySchema.index({ "listingInformation.listingInformationZoneSubArea.en": 1 });
CreatePropertySchema.index({ "listingInformation.listingInformationZoneSubArea.vi": 1 });

// 🚀 Compound index for common listing page query pattern
CreatePropertySchema.index({
  status: 1,
  "listingInformation.listingInformationTransactionType.en": 1,
  "financialDetails.financialDetailsPrice": 1,
  createdAt: -1
});

module.exports = mongoose.model("CreateProperty", CreatePropertySchema);
