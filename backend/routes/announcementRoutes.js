const express = require('express');
const router = express.Router();
const {
    requestAnnouncement,
    getAllAnnouncements,
    getMyAnnouncements,
    getAnnouncements, 
    updateAnnouncementStatus,
    deleteAnnouncement,
    updateAnnouncement
} = require('../controllers/announcementController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware, superAdminMiddleware } = require('../middleware/adminMiddleware');

// 1. Subscription Route (Token store karne ke liye)
router.post('/subscribe', authMiddleware, require('../controllers/announcementController').subscribeUser);

// 2. Public/General User Routes (Header Bell, Homepage, AnnouncementsPage)
// GET /api/announcements?limit=5&status=approved
router.get('/', getAnnouncements); 

// Track Notification Open (Public)
router.put('/:id/track-open', require('../controllers/announcementController').trackAnnouncementOpen);

// 2. Admin/Uploader Routes (Auth Required)
// POST /api/announcements/request 
router.post('/request', authMiddleware, adminMiddleware, requestAnnouncement);
// GET /api/announcements/my-requests 
router.get('/my-requests', authMiddleware, adminMiddleware, getMyAnnouncements);
// PUT /api/announcements/:id 
router.put('/:id', authMiddleware, adminMiddleware, updateAnnouncement);
// DELETE /api/announcements/:id
router.delete('/:id', authMiddleware, adminMiddleware, deleteAnnouncement);


// 3. SuperAdmin Routes (SuperAdminMiddleware Required)
// GET /api/announcements/all (SuperAdmin sab dekhta hai)
router.get('/all', authMiddleware, superAdminMiddleware, getAllAnnouncements);
// PUT /api/announcements/:id/status (Approve/Reject)
router.put('/:id/status', authMiddleware, superAdminMiddleware, updateAnnouncementStatus);

module.exports = router;