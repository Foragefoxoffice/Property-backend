const express = require("express");
const {
    getFurnishings,
    createFurnishing,
    updateFurnishing,
    deleteFurnishing,
} = require("../controllers/furnishingController");

const router = express.Router();

router.route("/")
    .get(getFurnishings)
    .post(createFurnishing);

router.route("/:id")
    .put(updateFurnishing)
    .delete(deleteFurnishing);

module.exports = router;
