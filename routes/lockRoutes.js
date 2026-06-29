const express = require("express");
const { acquireLock, releaseLock, heartbeatLock } = require("../controllers/lockController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect); // All lock routes require authentication

router.post("/acquire", acquireLock);
router.post("/release", releaseLock);
router.post("/heartbeat", heartbeatLock);

module.exports = router;
