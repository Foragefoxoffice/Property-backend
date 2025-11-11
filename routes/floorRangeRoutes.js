const express = require("express");
const {
  getFloorRanges,
  createFloorRange,
  updateFloorRange,
  deleteFloorRange,
} = require("../controllers/floorRangeController");

const router = express.Router();

router.route("/").get(getFloorRanges).post(createFloorRange);
router.route("/:id").put(updateFloorRange).delete(deleteFloorRange);

module.exports = router;
