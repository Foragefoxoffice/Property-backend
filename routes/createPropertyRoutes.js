const express = require("express");
const {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  getNextPropertyId,
} = require("../controllers/createPropertyController");

const router = express.Router();

// ✅ GET NEXT PROPERTY ID FIRST!
router.get("/next-id", getNextPropertyId);

// ✅ Main Property Routes
router.route("/").get(getProperties).post(createProperty);

router
  .route("/:id")
  .get(getProperty)
  .put(updateProperty)
  .delete(deleteProperty);

module.exports = router;
