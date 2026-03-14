const express = require('express');
const router = express.Router();
const { getAiResponse } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

const optionalAuth = require('../middleware/optionalAuth');

// Everyone can chat with AI (User context added via optionalAuth)
router.post('/chat', optionalAuth, getAiResponse);

module.exports = router;
