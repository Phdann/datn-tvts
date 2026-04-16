const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDirs = ['uploads/news', 'uploads/events', 'uploads/banners', 'uploads/scholarships', 'uploads/posts'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'uploads/';
        if (req.path.includes('/news')) folder += 'news/';
        else if (req.path.includes('/events')) folder += 'events/';
        else if (req.path.includes('/banners')) folder += 'banners/';
        else if (req.path.includes('/scholarships')) folder += 'scholarships/';
        else if (req.path.includes('/posts')) folder += 'posts/';
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
