const express = require("express");
const {
    createEnquiry,
    getEnquiries,
    bulkDeleteEnquiries,
} = require("../controllers/contactEnquiryController");

const router = express.Router();

router.route("/")
    .post(createEnquiry)
    .get(getEnquiries);

router.route("/bulk-delete")
    .delete(bulkDeleteEnquiries);

module.exports = router;
