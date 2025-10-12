const express = require("express");
const {
  getOwners,
  createOwner,
  updateOwner,
  deleteOwner, // ✅ must exist
} = require("../controllers/ownerController");

const router = express.Router();

router.route("/").get(getOwners).post(createOwner);
router.route("/:id").put(updateOwner).delete(deleteOwner);

module.exports = router;
