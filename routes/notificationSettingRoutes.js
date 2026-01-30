const express = require('express');
const {
    getNotificationSettings,
    updateNotificationSettings
} = require('../controllers/notificationSettingController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router
    .route('/')
    .get(getNotificationSettings)
    .put(updateNotificationSettings);

module.exports = router;
