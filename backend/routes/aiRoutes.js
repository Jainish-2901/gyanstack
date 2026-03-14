const express = require('express');
const router = express.Router();
const { getAiResponse } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

// Logged in users can chat with AI
router.post('/chat', authMiddleware, getAiResponse);

module.exports = router;
