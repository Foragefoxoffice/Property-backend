const express = require("express");
const {
  getBlocks,
  createBlock,
  updateBlock,
  deleteBlock,
} = require("../controllers/blockController");

const router = express.Router();

router.route("/").get(getBlocks).post(createBlock);
router.route("/:id").put(updateBlock).delete(deleteBlock);

module.exports = router;
