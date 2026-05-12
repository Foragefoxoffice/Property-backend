const express = require("express");
const {
  getOwners,
  getOwner,
  createOwner,
  updateOwner,
  deleteOwner, // ✅ must exist
} = require("../controllers/ownerController");

const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect); // Protect all owner routes

router.route("/").get(getOwners).post(createOwner);
router.route("/:id").get(getOwner).put(updateOwner).delete(deleteOwner);

module.exports = router;
