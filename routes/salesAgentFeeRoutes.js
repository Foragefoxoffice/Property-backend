const express = require("express");
const {
  getSalesAgentFee,
  createSalesAgentFee,
  updateSalesAgentFee,
  deleteSalesAgentFee,
} = require("../controllers/salesAgentFeeController");

const router = express.Router();

router.route("/").get(getSalesAgentFee).post(createSalesAgentFee);
router.route("/:id").put(updateSalesAgentFee).delete(deleteSalesAgentFee);

module.exports = router;
