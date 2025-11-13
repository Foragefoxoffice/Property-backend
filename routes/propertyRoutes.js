const express = require("express");
const {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");

const router = express.Router();

router.route("/").get(getProperties).post(createProperty);

router.route("/:id").put(updateProperty).delete(deleteProperty);

module.exports = router;
