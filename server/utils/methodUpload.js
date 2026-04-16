const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads/methods/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'method-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const methodUpload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only image files are allowed!"));
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = methodUpload;
