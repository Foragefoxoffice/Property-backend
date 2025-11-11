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
  { _id: false, strict: false } // ✅ critical: keeps empty/partial keys
);

/* =========================================================
   📍 Subschemas
========================================================= */
const AmenitySchema = new mongoose.Schema(
  {
    whatNearbyAmenityName: LocalizedString,
    whatNearbyKm: { type: Number, default: 0 },
  },
  { _id: true }
);

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
      // listingInformationCountry: { type: String, trim: true, default: "" },
      // listingInformationState: { type: String, trim: true, default: "" },
      // listingInformationCity: LocalizedString,
      // listingInformationPostalCode: { type: String, trim: true, default: "" },
      // listingInformationAddress: LocalizedString,
      listingInformationDateListed: { type: Date, default: Date.now },
      listingInformationAvailabilityStatus: LocalizedString,
      listingInformationAvailableFrom: { type: Date },
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
      // informationFloorNumber: { type: Number, default: 0 },
      informationFurnishing: LocalizedString,
      // informationYearBuilt: { type: Number, default: null },
      informationView: LocalizedString,
      // informationParkingAvailability: LocalizedString,
      // informationPetPolicy: LocalizedString,
    },

    /* 📍 3. What’s Nearby */
    whatNearby: {
      // whatNearbyContent: LocalizedString,
      whatNearbyDescription: LocalizedString,
      // whatNearbyList: [AmenitySchema],
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
      // 🆕 Added Fields
      financialDetailsLeasePrice: { type: Number, default: 0 },
      financialDetailsContractLength: { type: String, trim: true, default: "" },
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
      contactManagementOwnerNotes: LocalizedString,
      contactManagementConsultant: LocalizedString,
      contactManagementConnectingPoint: LocalizedString,
      contactManagementConnectingPointNotes: LocalizedString,
      contactManagementInternalNotes: LocalizedString,
      contactManagementSource: LocalizedString,
      contactManagementAgentFee: { type: Number, default: 0 },
    },
    /* 🧩 Meta */
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
