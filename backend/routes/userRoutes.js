const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { subscribeUser } = require('../controllers/userController'); // NAYA IMPORT

// POST /api/users/subscribe - Push Notification Token save/update karein
router.post('/subscribe', authMiddleware, subscribeUser);

// Note: Yahaan aapke baaki user-related routes (profile fetch, update) aayenge.

module.exports = router;