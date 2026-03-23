const express = require("express");
const {
  getFeeTax,
  createFeeTax,
  updateFeeTax,
  deleteFeeTax,
} = require("../controllers/feeTaxController");

const router = express.Router();

router.route("/").get(getFeeTax).post(createFeeTax);
router.route("/:id").put(updateFeeTax).delete(deleteFeeTax);

module.exports = router;
