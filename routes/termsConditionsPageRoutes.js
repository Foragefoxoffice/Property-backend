const express = require("express");
const {
    getTermsConditionsPage,
    updateTermsConditionsPage,
    uploadTermsConditionsPageImage,
} = require("../controllers/termsConditionsPageController");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

// Public routes
router.get("/", getTermsConditionsPage);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize("admin", "manager"));

router.post("/", updateTermsConditionsPage);
router.post("/upload-image", uploadTermsConditionsPageImage);

module.exports = router;
