const express = require("express");
const {
  getStaffs,
  createStaff,
  updateStaff,
  deleteStaff,
} = require("../controllers/staffController");

const router = express.Router();

router.route("/").get(getStaffs).post(createStaff);
router.route("/:id").put(updateStaff).delete(deleteStaff);

module.exports = router;
