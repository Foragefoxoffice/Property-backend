const express = require('express');
const router = express.Router();
const { getFooter, updateFooter, uploadFooterImage } = require('./controller');

router.get('/get-footer', getFooter);
router.put('/update-footer', updateFooter);
router.post('/upload', uploadFooterImage);

module.exports = router;
