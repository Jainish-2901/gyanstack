const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  updateUserRole,
  getDashboardStats // --- NAYA IMPORT ---
} = require('../controllers/adminController'); 
const authMiddleware = require('../middleware/authMiddleware');

// --- CHANGE: Middleware ko alag-alag import karein ---
const { adminMiddleware, superAdminMiddleware } = require('../middleware/adminMiddleware');

// --- NAYA ROUTE (DASHBOARD STATS) ---
// Ise Admin aur SuperAdmin dono access kar sakte hain
// Isliye 'adminMiddleware' ka use karein (SuperAdmin isse pass ho jayega)
router.get('/stats', authMiddleware, adminMiddleware, getDashboardStats);
// ------------------------------------


// --- SuperAdmin Only Routes ---
// (Middleware ko global 'router.use' se hata kar individual route par lagayein)

// Route 1: Get All Users (SuperAdmin Only)
router.get('/users', authMiddleware, superAdminMiddleware, getAllUsers);

// Route 2: Update User Role (SuperAdmin Only)
router.put('/users/:id/role', authMiddleware, superAdminMiddleware, updateUserRole);

// (Yahaan se sabhi Announcement routes HATA diye gaye hain)

module.exports = router;