const express = require('express');
const router = express.Router();
const { 
  uploadContent, 
  getContent,
  getMyContent,
  updateContent,
  deleteContent,
  getSingleContent,
  likeContent,
  saveContent,
  getSavedContent,
  trackDownload,
  bulkDeleteContent,
  reassignContent,
  getGlobalContentManagement
} = require('../controllers/contentController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware, superAdminMiddleware } = require('../middleware/adminMiddleware');
const upload =require('../middleware/uploadMiddleware'); // Yahaan se import ho raha hai

// Define the maximum number of files allowed in a batch
const MAX_FILES = 20;

// Route 1: Naya Content Upload (POST /) - BATCH UPLOAD KE LIYE UPDATE KIYA GAYA
router.post('/', authMiddleware, adminMiddleware, (req, res, next) => {
  upload.array('files', MAX_FILES)(req, res, (err) => {
    if (err) {
      // Log full error for backend debugging
      console.error('Multer upload error:', err.code, err.message, err.stack?.split('\n')[1]);

      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'One or more files exceed the 100MB limit. Please use External Link (Google Drive) upload mode for very large files.'
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: `Too many files uploaded. Max allowed is ${MAX_FILES}.` });
      }
      return res.status(400).json({
        message: `Upload middleware error: ${err.message || 'Unknown error'}. If your file is larger than 4.5MB, use External Link (Google Drive) mode instead.`
      });
    }

    // Guard: file required but none received after multer ran
    if ((!req.files || req.files.length === 0) && req.body && req.body.type === 'file' && req.body.uploadMode !== 'external') {
      console.warn('Upload attempt with type=file but req.files is empty. Body:', req.body);
      return res.status(400).json({
        message: 'No file received by server. Ensure the file input field is named "files". If your file exceeds 4.5MB on Vercel, use External Link (Google Drive) mode.'
      });
    }
    next();
  });
}, uploadContent);
// -----------------------------------------------------------------------------------


// Route 2: Content Update (PUT /:id) - SINGLE FILE UPDATE WAISE HI RAHENGA
router.put('/:id', authMiddleware, adminMiddleware, (req, res, next) => {
  // Note: Yahaan sirf ek file replace hogi, isliye upload.single('file') sahi hai
  upload.single('file')(req, res, (err) => {
    // Hum error ko pakdenge, lekin crash nahi karenge
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large. Max limit is 100MB.' });
      }
      return res.status(400).json({ 
        message: err.message || 'File replacement failed.' 
      });
    }
    next();
  });
}, updateContent);


// ... (Baaki saare routes pehle jaise hi rahenge) ...
router.get('/', getContent);
router.get('/saved', authMiddleware, getSavedContent);
router.get('/my-content', authMiddleware, adminMiddleware, getMyContent);
router.get('/manage-all', authMiddleware, superAdminMiddleware, getGlobalContentManagement);
router.post('/reassign', authMiddleware, superAdminMiddleware, reassignContent);

router.get('/:id', getSingleContent);
router.put('/:id/like', authMiddleware, likeContent);
router.put('/:id/save', authMiddleware, saveContent);
router.put('/:id/download', authMiddleware, trackDownload);
router.delete('/bulk-delete', authMiddleware, adminMiddleware, bulkDeleteContent);
router.delete('/:id', authMiddleware, adminMiddleware, deleteContent);

module.exports = router;