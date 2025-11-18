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
  saveContent, // --- NAYA IMPORT ---
  getSavedContent,
  trackDownload // --- NAYA IMPORT (DOWNLOAD) ---
} = require('../controllers/contentController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');
const upload =require('../middleware/uploadMiddleware'); // Yahaan se import ho raha hai

// Define the maximum number of files allowed in a batch
const MAX_FILES = 20;

// Route 1: Naya Content Upload (POST /) - BATCH UPLOAD KE LIYE UPDATE KIYA GAYA
router.post('/', authMiddleware, adminMiddleware, (req, res, next) => {
  // --- CHANGE: upload.single('file') ko upload.array('files', MAX_FILES) se badla ---
  upload.array('files', MAX_FILES)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'One or more files are too large. Max limit is 100MB per file.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: `Too many files uploaded. Max allowed is ${MAX_FILES}.` });
      }
      return res.status(400).json({ 
        message: err.message || 'File upload failed. Check file type or size.' 
      });
    }
    // Agar koi file upload nahi hui, aur yeh 'note' ya 'link' nahi hai, to error dein
    if (!req.files || req.files.length === 0) {
      if (req.body.type === 'file') {
        return res.status(400).json({ message: 'File is required for file type content.' });
      }
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
router.get('/:id', getSingleContent);
router.put('/:id/like', authMiddleware, likeContent);
router.put('/:id/save', authMiddleware, saveContent);
router.put('/:id/download', authMiddleware, trackDownload);
router.delete('/:id', authMiddleware, adminMiddleware, deleteContent);

module.exports = router;