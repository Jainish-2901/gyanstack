const express = require('express');
const router = express.Router();
const { getAiResponse, getChatHistory } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

const optionalAuth = require('../middleware/optionalAuth');

router.post('/chat', optionalAuth, getAiResponse);

router.get('/history/:sessionId', authMiddleware, getChatHistory);
router.get('/history', authMiddleware, getChatHistory);

module.exports = router;
