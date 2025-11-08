const express = require("express");
const {
  getLegalDocuments,
  createLegalDocument,
  updateLegalDocument,
  deleteLegalDocument,
} = require("../controllers/legalDocumentController");

const router = express.Router();

router.route("/")
  .get(getLegalDocuments)
  .post(createLegalDocument);

router.route("/:id")
  .put(updateLegalDocument)
  .delete(deleteLegalDocument);

module.exports = router;
