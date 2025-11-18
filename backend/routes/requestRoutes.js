const express = require('express');
const router = express.Router();
const { createRequest, getRequests } = require('../controllers/requestController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

// Route 1: Nayi Request Banana (User Only)
router.post('/', authMiddleware, createRequest);

// Route 2: Sabhi Pending Requests Lena (Admin Only)
router.get('/', authMiddleware, adminMiddleware, getRequests);

module.exports = router;