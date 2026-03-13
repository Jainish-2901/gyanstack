const multer = require('multer');
const path = require('path');
const fs = require('fs');

const os = require('os');

// Temporary uploads folder ensure karein
// Vercel like serverless environments mein sirf /tmp writable hota hai
const uploadDir = path.join(os.tmpdir(), 'gyanstack_uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1024 // 1GB Limit (Drive is better for large files)
    }
});

module.exports = upload;