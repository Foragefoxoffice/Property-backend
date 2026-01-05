const express = require('express');
const router = express.Router();
const footerController = require('../controllers/footer/routes');

router.use('/', footerController);

module.exports = router;
