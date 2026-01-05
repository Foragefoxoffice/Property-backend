const express = require('express');
const router = express.Router();
const headerController = require('../controllers/header/routes');

router.use('/', headerController);

module.exports = router;
