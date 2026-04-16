const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');

const majorController = require('../controllers/majorController');
const chatController = require('../controllers/chatController');
const historicalScoreController = require('../controllers/historicalScoreController');
const postController = require('../controllers/postController');
const categoryController = require('../controllers/categoryController');
const facultyController = require('../controllers/facultyController');
const settingsController = require('../controllers/settingsController');
const admissionMethodController = require('../controllers/admissionMethodController');
const eventController = require('../controllers/eventController');
const searchController = require('../controllers/searchController');

/**
 * @swagger
 * tags:
 *   name: Public
 *   description: API công khai dành cho ứng dụng khách
 */

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Tìm kiếm toàn cầu
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm
 *     responses:
 *       200:
 *         description: Kết quả tìm kiếm
 */
/**
 * @swagger
 * /api/search/suggestions:
 *   get:
 *     summary: Lấy gợi ý tìm kiếm
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Danh sách gợi ý
 */
router.get('/search', searchController.globalSearch);
router.get('/search/suggestions', searchController.searchSuggestions);

/**
 * @swagger
 * /api/majors:
 *   get:
 *     summary: Lấy danh sách tất cả các ngành học
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Danh sách các ngành học
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Major'
 */
router.get('/majors', majorController.getAllMajors);

/**
 * @swagger
 * /api/majors/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết một ngành học theo ID
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin chi tiết ngành học
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Major'
 */
/**
 * @swagger
 * /api/majors/{id}/images:
 *   get:
 *     summary: Lấy danh sách hình ảnh của ngành học
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
router.get('/majors/:id', majorController.getMajorById);
router.get('/majors/:id/images', require('../controllers/majorImageController').getMajorImages);

/**
 * @swagger
 * /api/faculties:
 *   get:
 *     summary: Lấy danh sách các khoa
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Danh sách các khoa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Faculty'
 */
router.get('/faculties', facultyController.getAllFaculties);

/**
 * @swagger
 * /api/faculties/slug/{slug}:
 *   get:
 *     summary: Lấy thông tin khoa theo slug
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin chi tiết khoa
 */
router.get('/faculties/slug/:slug', facultyController.getFacultyBySlug);

/**
 * @swagger
 * /api/faculties/{id}:
 *   get:
 *     summary: Lấy thông tin khoa theo ID
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin chi tiết khoa
 */
router.get('/faculties/:id', facultyController.getFacultyById);



/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Gửi tin nhắn cho Chatbot hỗ trợ tư vấn
 *     tags: [Public]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message: { type: string }
 *               sessionId: { type: string }
 *     responses:
 *       200:
 *         description: Trả lời từ AI
 */
/**
 * @swagger
 * /api/chat/history/{sessionId}:
 *   get:
 *     summary: Lấy lịch sử chat của một phiên làm việc
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema: { type: string }
 */
router.post('/chat', chatController.sendMessage);
router.get('/chat/history/:sessionId', chatController.getChatHistory);

/**
 * @swagger
 * /api/predict-admission:
 *   post:
 *     summary: Dự đoán khả năng trúng tuyển dựa trên điểm số
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Kết quả dự đoán
 */
router.post('/predict-admission', historicalScoreController.predictAdmission);

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Lấy danh sách tin tức công khai
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Danh sách bài viết
 */
/**
 * @swagger
 * /api/posts/slug/{slug}:
 *   get:
 *     summary: Lấy chi tiết bài viết theo slug
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Trả về chi tiết bài viết
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 title: { type: string }
 *                 content: { type: string }
 *                 slug: { type: string }
 *                 views: { type: integer }
 *                 Category: { $ref: '#/components/schemas/Category' }
 *                 User: { $ref: '#/components/schemas/User' }
 *       404:
 *         description: Không tìm thấy bài viết
 */
router.get('/posts', postController.getPublishedPosts);
router.get('/posts/slug/:slug', postController.getPostBySlug);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Lấy chi tiết bài viết theo ID
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
router.get('/posts/:id', postController.getPostById);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lấy danh sách danh mục bài viết
 *     tags: [Public]
 */
router.get('/categories', categoryController.getAllCategories);
router.get('/config', settingsController.getPublicConfig);

/**
 * @swagger
 * /api/banners:
 *   get:
 *     summary: Lấy danh sách banner quảng cáo/hero
 *     tags: [Public]
 */
const bannerController = require('../controllers/bannerController');
router.get('/banners', bannerController.getAllBanners);

/**
 * @swagger
 * /api/admission-methods:
 *   get:
 *     summary: Lấy danh sách phương thức tuyển sinh
 *     tags: [Public]
 */
router.get('/admission-methods', admissionMethodController.getAllAdmissionMethods);

/**
 * @swagger
 * /api/historical-scores:
 *   get:
 *     summary: Lấy danh sách điểm chuẩn các năm
 *     tags: [Public]
 */
router.get('/historical-scores', historicalScoreController.getAllHistoricalScores);

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Lấy danh sách sự kiện tuyển sinh
 *     tags: [Public]
 */
router.get('/events', eventController.getAllEvents);

/**
 * @swagger
 * /api/scholarships:
 *   get:
 *     summary: Lấy danh sách học bổng
 *     tags: [Public]
 */
const scholarshipController = require('../controllers/scholarshipController');
router.get('/scholarships', scholarshipController.getAllScholarships);

/**
 * @swagger
 * /api/training-types:
 *   get:
 *     summary: Lấy danh sách hệ đào tạo (Chính quy, vừa học vừa làm...)
 *     tags: [Public]
 */
router.get('/training-types', require('../controllers/trainingTypeController').getAllTrainingTypes);


module.exports = router;
