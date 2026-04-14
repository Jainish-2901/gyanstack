const express = require('express');
const router = express.Router();
const { getFCMPulse, trackExternalPulse } = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware');
const { superAdminMiddleware } = require('../middleware/adminMiddleware');

router.get('/fcm-pulse', authMiddleware, superAdminMiddleware, getFCMPulse);

router.put('/track-external-pulse', trackExternalPulse);

module.exports = router;
