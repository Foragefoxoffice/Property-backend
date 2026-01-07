const express = require("express");
const {
    createEnquiry,
    getEnquiries,
} = require("../controllers/contactEnquiryController");

const router = express.Router();

router.route("/")
    .post(createEnquiry)
    .get(getEnquiries);

module.exports = router;
