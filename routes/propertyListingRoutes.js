const express = require("express");
const router = express.Router(); // ✅ THIS LINE WAS MISSING

const {
  getListingByPropertyId,
} = require("../controllers/propertyListingController");

// ✅ GET property by propertyId (PHS001, PHS002, etc)
router.get("/pid/:propertyId", getListingByPropertyId);

module.exports = router;
