const express = require('express');
const router = express.Router();
const { getHeader, updateHeader, uploadHeaderImage } = require('./controller');

// GET header data
router.get('/get-header', getHeader);

// UPDATE header data
router.put('/update-header', updateHeader);

// UPLOAD header image
router.post('/upload', uploadHeaderImage);

module.exports = router;
