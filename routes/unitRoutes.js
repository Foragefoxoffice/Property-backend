const express = require("express");
const {
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  markAsDefault,
} = require("../controllers/unitController");

const router = express.Router();

router.route("/").get(getUnits).post(createUnit);

router.route("/:id").put(updateUnit).delete(deleteUnit);
router.put("/:id/default", markAsDefault);

module.exports = router;
