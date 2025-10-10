const express = require("express");
const {
    getPetPolicies,
    createPetPolicy,
    updatePetPolicy,
    deletePetPolicy,
} = require("../controllers/petPolicyController");

const router = express.Router();

router.route("/")
    .get(getPetPolicies)
    .post(createPetPolicy);

router.route("/:id")
    .put(updatePetPolicy)
    .delete(deletePetPolicy);

module.exports = router;
