const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary ko config karein (API keys se)
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Cloudinary Storage engine banayein
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gyanstack_uploads', // Cloudinary mein folder ka naam
    allowed_formats: ['jpg', 'png', 'pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'mp4', 'mkv', 'm4a' , 'avi', 'sifz' , 'zip', 'rar'],
    
    // FIX 1: 'auto' zaroori hai taaki ye videos, images, aur raw files (PDF/PPT) ko handle kar sake
    resource_type: 'auto', 
    
    // OPTIMIZATION: Cloudinary me upload hote hi quality optimize ho jayegi
    // Isse images aur videos compress ho jayenge
    quality: 'auto:good',
    width: 1920,
    crop: 'limit'
  }
});

// Multer ko storage engine se connect karein
const upload = multer({ 
  storage: storage,
  
  // FIX 2: Server par file size limit set karein (Example: 100MB)
  // Iske bina server badi files par crash ho raha tha
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB Limit
  }
});

module.exports = upload;