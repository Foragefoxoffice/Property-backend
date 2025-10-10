const express = require("express");
const {
    getParkings,
    createParking,
    updateParking,
    deleteParking,
} = require("../controllers/parkingController");

const router = express.Router();

router.route("/")
    .get(getParkings)
    .post(createParking);

router.route("/:id")
    .put(updateParking)
    .delete(deleteParking);

module.exports = router;
