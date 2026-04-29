const express = require('express');
const router = express.Router();
const { getAgent, updateAgent, uploadAgentImage } = require('./controller');

const { protect } = require('../../middleware/auth');

router.get('/get-agent', getAgent);

// Protected CMS routes
router.put('/update-agent', protect, updateAgent);
router.post('/upload', protect, uploadAgentImage);

module.exports = router;
