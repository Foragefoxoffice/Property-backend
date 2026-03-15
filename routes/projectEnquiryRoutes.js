const express = require("express");
const {
    createProjectEnquiry,
    getProjectEnquiries,
    deleteProjectEnquiry,
} = require("../controllers/projectEnquiryController");

const router = express.Router();

router.route("/")
    .post(createProjectEnquiry)
    .get(getProjectEnquiries)
    .delete(deleteProjectEnquiry);

module.exports = router;
