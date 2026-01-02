const express = require("express");
const router = express.Router();
const {
    getAboutPage,
    createAboutPage,
    updateAboutPage,
    uploadAboutPageImage,
} = require("../controllers/aboutPageController");

// Routes
router.get("/", getAboutPage);
router.post("/", createAboutPage);
router.put("/:id", updateAboutPage);
router.post("/upload", uploadAboutPageImage);

module.exports = router;
