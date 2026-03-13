const express = require('express');
const router = express.Router();
const { createRequest, getRequests, updateRequestStatus, getUserRequests } = require('../controllers/requestController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

// Route 1: Nayi Request Banana (User Only)
router.post('/', authMiddleware, createRequest);

// Route 2: User Apni Requests Lena (User Only)
router.get('/my-requests', authMiddleware, getUserRequests);

// Route 3: Sabhi Requests Lena (Admin Only)
router.get('/', authMiddleware, adminMiddleware, getRequests);

// Route 4: Request Status Update Karna (Admin Only)
router.put('/:id', authMiddleware, adminMiddleware, updateRequestStatus);

module.exports = router;