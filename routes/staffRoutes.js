const express = require("express");
const {
  getStaffs,
  createStaff,
  updateStaff,
  deleteStaff,
} = require("../controllers/staffController");

const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect); // Protect all staff routes

router.route("/").get(getStaffs).post(createStaff);
router.route("/:id").put(updateStaff).delete(deleteStaff);

module.exports = router;
