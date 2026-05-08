const express = require("express");
const {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  getNextPropertyId,
  getPropertyByPropertyId,
  permanentlyDeleteProperty,
  copyPropertyToSale,
  copyPropertyToLease,
  copyPropertyToHomeStay,
  restoreProperty,
  getPropertiesByTransactionType,
  getTrashProperties,
  getListingProperties,
  validatePropertyNo,
} = require("../controllers/createPropertyController");

const { bulkUploadProperties } = require("../controllers/bulkUploadController");

const { protect, optionalProtect } = require("../middleware/auth");

const router = express.Router();
console.log("🔥 createPropertyRoutes.js LOADED");

// ✅ GET NEXT PROPERTY ID FIRST!
router.get("/next-id", getNextPropertyId);
router.post("/validate-property-no", validatePropertyNo);
router.get("/pid/:propertyId", optionalProtect, getPropertyByPropertyId);
router.delete("/permanent-delete/:id", protect, permanentlyDeleteProperty);

// Copy Property Routes
router.post("/copy/sale/:id", protect, copyPropertyToSale);
router.post("/copy/lease/:id", protect, copyPropertyToLease);
router.post("/copy/homestay/:id", protect, copyPropertyToHomeStay);
router.put("/restore/:id", protect, restoreProperty);

// Bulk Upload Route
router.post("/bulk-upload", protect, bulkUploadProperties);

// ✅ Main Property Routes
router.route("/").get(optionalProtect, getProperties).post(protect, createProperty);

router.get("/transaction", optionalProtect, getPropertiesByTransactionType);
router.get("/trash", protect, getTrashProperties);
router.get("/listing", optionalProtect, getListingProperties); // New optimized listing API


router
  .route("/:id")
  .get(optionalProtect, getProperty)
  .put(protect, updateProperty)
  .delete(protect, deleteProperty);

module.exports = router;
