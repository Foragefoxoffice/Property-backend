const express = require('express');
const router = express.Router();
const { getAgent, updateAgent, uploadAgentImage } = require('./controller');

router.get('/get-agent', getAgent);
router.put('/update-agent', updateAgent);
router.post('/upload', uploadAgentImage);

module.exports = router;
