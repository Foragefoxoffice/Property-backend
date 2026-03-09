const express = require("express");
const router = express.Router();
const {
    getProjectOverview,
    createProjectOverview,
    updateProjectOverview,
} = require("../controllers/projectOverviewController");

// Protect routes if necessary
const { protect, checkInactive } = require("../middleware/auth");

router.route("/")
    .get(getProjectOverview)
    .post(protect, checkInactive, createProjectOverview);

router.route("/:id")
    .put(protect, checkInactive, updateProjectOverview);

module.exports = router;
