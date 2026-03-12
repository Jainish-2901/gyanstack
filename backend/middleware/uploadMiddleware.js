const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gyanstack_uploads', // Cloudinary mein folder ka naam
    
    // FIX 1: 'auto' zaroori hai taaki ye videos, images, aur raw files (PDF/PPT/Any) ko handle kar sake
    resource_type: 'auto', 
    
    // OPTIMIZATION: Cloudinary me upload hote hi quality optimize ho jayegi
    quality: 'auto:good',
    // Remove width/crop/height for raw files to avoid conversion errors
  }
});

// Multer ko storage engine se connect karein
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB Limit
  }
});

module.exports = upload;