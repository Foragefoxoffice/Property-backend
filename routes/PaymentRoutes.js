const express = require("express");
const {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
} = require("../controllers/paymentController");

const router = express.Router();

router.route("/").get(getPayments).post(createPayment);

router.route("/:id").put(updatePayment).delete(deletePayment);

module.exports = router;
