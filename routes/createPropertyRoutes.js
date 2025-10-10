// routes/createPropertyRoutes.js
const express = require("express");
const {
    getProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
} = require("../controllers/createPropertyController");

const router = express.Router();

router.route("/")
    .get(getProperties)
    .post(createProperty);

router.route("/:id")
    .get(getPropertyById)
    .put(updateProperty)
    .delete(deleteProperty);

module.exports = router;
