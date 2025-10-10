const express = require("express");
const {
    getZoneSubAreas,
    createZoneSubArea,
    updateZoneSubArea,
    deleteZoneSubArea,
} = require("../controllers/zoneSubAreaController");

const router = express.Router();

router.route("/")
    .get(getZoneSubAreas)
    .post(createZoneSubArea);

router.route("/:id")
    .put(updateZoneSubArea)
    .delete(deleteZoneSubArea);

module.exports = router;
