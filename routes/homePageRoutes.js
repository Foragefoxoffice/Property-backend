const express = require("express");
const router = express.Router();
const {
    getHomePage,
    createHomePage,
    updateHomePage,
    uploadHomePageImage,
} = require("../controllers/homePageController");

// Public routes
router.get("/", getHomePage);

// Protected routes (add authentication middleware as needed)
router.post("/upload", uploadHomePageImage);
router.post("/", createHomePage);
router.put("/:id", updateHomePage);

module.exports = router;
