const express = require("express");
const router = express.Router();
const {
    getContactPage,
    createContactPage,
    updateContactPage,
    uploadContactPageImage,
} = require("../controllers/contactPageController");

// Routes
router.get("/", getContactPage);
router.post("/", createContactPage);
router.put("/:id", updateContactPage);
router.post("/upload", uploadContactPageImage);

module.exports = router;
