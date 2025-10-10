const express = require("express");
const {
    getUnits,
    createUnit,
    updateUnit,
    deleteUnit,
} = require("../controllers/unitController");

const router = express.Router();

router.route("/")
    .get(getUnits)
    .post(createUnit);

router.route("/:id")
    .put(updateUnit)
    .delete(deleteUnit);

module.exports = router;
