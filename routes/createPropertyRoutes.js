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
} = require("../controllers/createPropertyController");

const router = express.Router();
console.log("🔥 createPropertyRoutes.js LOADED");

// ✅ GET NEXT PROPERTY ID FIRST!
router.get("/next-id", getNextPropertyId);
router.get("/pid/:propertyId", getPropertyByPropertyId);
router.delete("/permanent-delete/:id", permanentlyDeleteProperty);

// Copy Property Routes
router.post("/copy/sale/:id", copyPropertyToSale);
router.post("/copy/lease/:id", copyPropertyToLease);
router.post("/copy/homestay/:id", copyPropertyToHomeStay);
router.put("/restore/:id", restoreProperty);
// ✅ Main Property Routes
router.route("/").get(getProperties).post(createProperty);

router
  .route("/:id")
  .get(getProperty)
  .put(updateProperty)
  .delete(deleteProperty);

module.exports = router;
