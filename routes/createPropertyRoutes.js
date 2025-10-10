const express = require("express");
const {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
} = require("../controllers/createPropertyController");

const router = express.Router();

router.route("/").get(getProperties).post(createProperty);

router
  .route("/:id")
  .get(getProperty)
  .put(updateProperty)
  .delete(deleteProperty);

module.exports = router;
