const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agent/routes');

// Mount all agent routes
router.use('/', agentController);

module.exports = router;
