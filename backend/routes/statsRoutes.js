const express = require('express');
const router = express.Router();
const { getFCMPulse, trackGeneralOpen } = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware');
const { superAdminMiddleware } = require('../middleware/adminMiddleware');

// 1. Get Global Analytics (SuperAdmin Only)
router.get('/fcm-pulse', authMiddleware, superAdminMiddleware, getFCMPulse);

// 2. Track Anonymous/Console Open (Public)
router.put('/track-external-open', trackGeneralOpen);

module.exports = router;
