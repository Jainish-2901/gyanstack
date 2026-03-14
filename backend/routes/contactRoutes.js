const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware, superAdminMiddleware } = require('../middleware/adminMiddleware');

// Public: Submit Form
router.post('/', contactController.submitContactForm);

// Protected: User - Retrieve their own inquiries
router.get('/my-inquiries', authMiddleware, contactController.getMyInquiries);

// Protected: SuperAdmin only - Retrieve All Inquiries
router.get('/', authMiddleware, superAdminMiddleware, contactController.getContactMessages);

// Protected: SuperAdmin only - Update Status/Action
router.put('/:id/status', authMiddleware, superAdminMiddleware, contactController.updateMessageStatus);

// Protected: SuperAdmin only - Delete Message
router.delete('/:id', authMiddleware, superAdminMiddleware, contactController.deleteMessage);

module.exports = router;
