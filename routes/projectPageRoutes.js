const express = require("express");
const router = express.Router();
const {
    getProjectPage,
    createProjectPage,
    updateProjectPage,
} = require("../controllers/projectPageController");

const { protect, checkInactive } = require("../middleware/auth");

router.route("/")
    .get(getProjectPage)
    .post(protect, checkInactive, createProjectPage);

router.route("/:id")
    .put(protect, checkInactive, updateProjectPage);

module.exports = router;
