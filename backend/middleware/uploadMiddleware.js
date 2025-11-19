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
  // FIX: 'params' ko object ki jagah FUNCTION banayein
  params: async (req, file) => {
    
    // 1. Determine Resource Type
    let resource_type = 'raw'; // Default for docx, zip, rar, sifz, etc.
    
    if (file.mimetype.startsWith('image')) {
        resource_type = 'image';
    } else if (file.mimetype.startsWith('video') || file.originalname.endsWith('.avi') || file.originalname.endsWith('.mkv')) {
        resource_type = 'video';
    } else if (file.mimetype.includes('audio')) {
        resource_type = 'video'; // Cloudinary treats audio as video type often
    }

    // 2. Apply Transformations ONLY for Images/Videos
    // Raw files par quality/width lagane se upload fail ho jata hai
    const transformation = (resource_type === 'image' || resource_type === 'video') 
      ? [
          { quality: 'auto:good', fetch_format: 'auto' }, // Compress
          { width: 1920, crop: 'limit' } // Resize if too big
        ] 
      : []; // Raw files ke liye koi transformation nahi

    return {
      folder: 'gyanstack_uploads',
      // Allowed formats list
      allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'mp4', 'mkv', 'm4a', 'avi', 'sifz', 'zip', 'rar'],
      
      resource_type: resource_type,
      transformation: transformation,
      
      // Raw files ke liye original naam rakhna zaroori hai taaki extension na kho jaye
      use_filename: true, 
      unique_filename: true
    };
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB Limit
  }
});

module.exports = upload;