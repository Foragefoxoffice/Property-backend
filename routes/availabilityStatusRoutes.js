const express = require("express");
const {
    getAvailabilityStatuses,
    createAvailabilityStatus,
    updateAvailabilityStatus,
    deleteAvailabilityStatus,
} = require("../controllers/availabilityStatusController");

const router = express.Router();

router.route("/")
    .get(getAvailabilityStatuses)
    .post(createAvailabilityStatus);

router.route("/:id")
    .put(updateAvailabilityStatus)
    .delete(deleteAvailabilityStatus);

module.exports = router;
