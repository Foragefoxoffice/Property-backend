const express = require("express");
const {
    getPrivacyPolicyPage,
    updatePrivacyPolicyPage,
    uploadPrivacyPolicyPageImage,
} = require("../controllers/privacyPolicyPageController");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

// Public routes
router.get("/", getPrivacyPolicyPage);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize("admin", "manager"));

router.post("/", updatePrivacyPolicyPage);
router.post("/upload-image", uploadPrivacyPolicyPageImage);

module.exports = router;
