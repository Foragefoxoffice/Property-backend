const express = require("express");
const {
  getOwners,
  createOwner,
  updateOwner,
  deleteOwner, // ✅ must exist
} = require("../controllers/ownerController");

const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect); // Protect all owner routes

router.route("/").get(getOwners).post(createOwner);
router.route("/:id").put(updateOwner).delete(deleteOwner);

module.exports = router;
