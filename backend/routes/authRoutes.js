const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  getSavedContent,
  updateUserProfile,
  changePassword,
  toggleSaveContent,
  getPublicStats,
  getPublicUserProfile,
  getTopUploaders,
  googleLogin,
  updateFCMToken
} = require('../controllers/authController');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // <-- Naya import

// Route 0: Public Stats (GET /api/auth/stats) - Public access
router.get('/stats', getPublicStats);

// Route 1: Register (POST /api/auth/register)
router.post(
  '/register',
  [
    body('username', 'Username is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('phone', 'Phone number is required').not().isEmpty(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  ],
  registerUser
);

// Route 2: Login (POST /api/auth/login)
router.post(
  '/login',
  [
    body('loginId', 'Login ID is required').not().isEmpty(),
    body('password', 'Password is required').exists(),
  ],
  loginUser
);

// Route 2.5: Google Login (POST /api/auth/google-login)
router.post('/google-login', googleLogin);

// Route 3: Forgot Password (POST /api/auth/forgotpassword)
router.post('/forgotpassword', [body('email', 'Please include a valid email').isEmail()], forgotPassword);

// Route 4: Reset Password (POST /api/auth/resetpassword)
router.post(
  '/resetpassword',
  [
    body('otp', 'OTP is required').not().isEmpty(),
    body('newPassword', 'New password must be 6 or more characters').isLength({ min: 6 }),
  ],
  resetPassword
);

// Route 5: Get User Profile (GET /api/auth/me)
router.get('/me', authMiddleware, getUserProfile);

// Route 6: Get Saved Content (GET /api/auth/saved-content)
router.get('/saved-content', authMiddleware, getSavedContent);

// --- YEH NAYE ROUTES HAIN ---

// Route 7: Update User Profile (PUT /api/auth/update-profile)
router.put(
  '/update-profile',
  authMiddleware,
  upload.single('profileImage'), // Handle single file upload
  [
    body('username', 'Username is required').not().isEmpty(),
    body('phone', 'Phone is required').not().isEmpty(),
  ],
  updateUserProfile
);

// Route 8: Change Password (PUT /api/auth/change-password)
router.put(
  '/change-password',
  authMiddleware,
  [
    body('currentPassword', 'Current password is required').not().isEmpty(),
    body('newPassword', 'New password must be 6 or more characters').isLength({ min: 6 }),
  ],
  changePassword
);

// Route 9: Content ko Save/Unsave Karna (PUT /api/auth/save/:id)
router.put('/save/:id', authMiddleware, toggleSaveContent);
// ---------------------------------

// Route 10: Public Uploader Profile (GET /api/auth/uploader/:id)
router.get('/uploader/:id', getPublicUserProfile);

// Route 11: Top Uploaders (GET /api/auth/top-uploaders)
router.get('/top-uploaders', getTopUploaders);

// Route 12: Update FCM Token (POST /api/auth/update-fcm-token)
router.post('/update-fcm-token', authMiddleware, updateFCMToken);

module.exports = router;