const express = require("express");
const {
    getPropertyTypes,
    createPropertyType,
    updatePropertyType,
    deletePropertyType,
} = require("../controllers/propertyTypeController");

const router = express.Router();

router.route("/")
    .get(getPropertyTypes)
    .post(createPropertyType);

router.route("/:id")
    .put(updatePropertyType)
    .delete(deletePropertyType);

module.exports = router;
