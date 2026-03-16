const express = require('express');
const router = express.Router();
const { getFCMPulse, trackExternalPulse } = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware');
const { superAdminMiddleware } = require('../middleware/adminMiddleware');

// 1. Get Global Analytics (SuperAdmin Only)
router.get('/fcm-pulse', authMiddleware, superAdminMiddleware, getFCMPulse);

// 2. Track Anonymous/Console Open/Sent (Public)
router.put('/track-external-pulse', trackExternalPulse);

module.exports = router;
