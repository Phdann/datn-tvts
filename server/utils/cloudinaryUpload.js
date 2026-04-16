const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const createCloudinaryStorage = (folderName) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `datn_tvts/${folderName}`,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
    }
  });
};

// Các cấu hình multer cho từng loại dữ liệu
const uploadGeneral = multer({ storage: createCloudinaryStorage('general') });
const uploadMajor = multer({ storage: createCloudinaryStorage('majors') });
const uploadFaculty = multer({ storage: createCloudinaryStorage('faculties') });
const uploadMethod = multer({ storage: createCloudinaryStorage('methods') });
const uploadPost = multer({ storage: createCloudinaryStorage('posts') });
const uploadNews = multer({ storage: createCloudinaryStorage('news') });
const uploadBanner = multer({ storage: createCloudinaryStorage('banners') });
const uploadScholarship = multer({ storage: createCloudinaryStorage('scholarships') });
const uploadTrainingType = multer({ storage: createCloudinaryStorage('training-types') });

module.exports = {
  cloudinary,
  uploadGeneral,
  uploadMajor,
  uploadFaculty,
  uploadMethod,
  uploadPost,
  uploadNews,
  uploadBanner,
  uploadScholarship,
  uploadTrainingType
};
