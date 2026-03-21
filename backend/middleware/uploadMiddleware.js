const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Temp upload directory — recreated on every require() so it always exists
const uploadDir = path.join(os.tmpdir(), 'gyanstack_uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (mkdirErr) {
  console.error('Failed to create upload temp dir:', mkdirErr.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the dir exists at write time too (it can vanish on Lambda/Vercel cold starts)
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (err) {
      console.error('Upload destination error:', err.message);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

module.exports = upload;