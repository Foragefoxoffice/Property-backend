const express = require("express");
const router = express.Router();
const {
    getProjectIntro,
    createProjectIntro,
    updateProjectIntro,
} = require("../controllers/projectIntroController");

// Protect routes if necessary
const { protect, checkInactive } = require("../middleware/auth");

router.route("/")
    .get(getProjectIntro)
    .post(protect, checkInactive, createProjectIntro);

router.route("/:id")
    .put(protect, checkInactive, updateProjectIntro);

module.exports = router;
