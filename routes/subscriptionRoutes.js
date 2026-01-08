const express = require("express");
const {
    createSubscription,
    getSubscriptions,
    deleteSubscription,
} = require("../controllers/subscriptionController");

const router = express.Router();

router.route("/")
    .post(createSubscription)
    .get(getSubscriptions);

router.route("/:id")
    .delete(deleteSubscription);

module.exports = router;
