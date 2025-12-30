const express = require("express");
const router = express.Router();
const {
    getAllHomeBanners,
    getHomeBannerById,
    createHomeBanner,
    updateHomeBanner,
    deleteHomeBanner,
    getActiveHomeBanner,
} = require("../controllers/homeBannerController");

// Public routes
router.get("/active", getActiveHomeBanner);
router.get("/", getAllHomeBanners);
router.get("/:id", getHomeBannerById);

// Protected routes (add authentication middleware as needed)
router.post("/", createHomeBanner);
router.put("/:id", updateHomeBanner);
router.delete("/:id", deleteHomeBanner);

module.exports = router;
