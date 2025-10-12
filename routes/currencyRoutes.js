const express = require("express");
const {
  getCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency,
  markAsDefault,
} = require("../controllers/currencyController");

const router = express.Router();

router.route("/").get(getCurrencies).post(createCurrency);
router.route("/:id").put(updateCurrency).delete(deleteCurrency);
router.put("/:id/default", markAsDefault);

module.exports = router;
