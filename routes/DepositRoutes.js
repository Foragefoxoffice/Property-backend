const express = require("express");
const {
  getDeposits,
  createDeposit,
  updateDeposit,
  deleteDeposit,
} = require("../controllers/depositController");

const router = express.Router();

router.route("/").get(getDeposits).post(createDeposit);

router.route("/:id").put(updateDeposit).delete(deleteDeposit);

module.exports = router;
