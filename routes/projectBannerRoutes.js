const express = require("express");
const {
    getProjectBanner,
    createProjectBanner,
    updateProjectBanner,
} = require("../controllers/projectBannerController");

const router = express.Router();

router.get("/", getProjectBanner);
router.post("/", createProjectBanner);
router.put("/:id", updateProjectBanner);

module.exports = router;
