const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

const majorController = require('../controllers/majorController');
const facultyController = require('../controllers/facultyController');
const subjectGroupController = require('../controllers/subjectGroupController');
const admissionMethodController = require('../controllers/admissionMethodController');
const historicalScoreController = require('../controllers/historicalScoreController');
const userController = require('../controllers/userController');
const roleController = require('../controllers/roleController');
const postController = require('../controllers/postController');
const categoryController = require('../controllers/categoryController');
const chatController = require('../controllers/chatController');
const statisticsController = require('../controllers/statisticsController');
const majorSubjectMappingController = require('../controllers/majorSubjectMappingController');
const ragController = require('../controllers/ragController');
const trainingTypeUpload = require('../utils/trainingTypeUpload');
const configUpload = require('../utils/configUpload');
const upload = require('../utils/generalUpload');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API quản trị yêu cầu quyền đăng nhập (Admin/Manager)
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/admin/majors/summary-stats:
 *   get:
 *     summary: "[Admin] Lấy thống kê tổng quát các ngành"
 *     tags: [Admin - Majors]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/majors/summary-stats', majorController.getMajorSummaryStats);

/**
 * @swagger
 * /api/admin/majors:
 *   get:
 *     summary: "[Admin] Lấy danh sách ngành học"
 *     tags: [Admin - Majors]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Thành công
 *   post:
 *     summary: "[Admin] Tạo ngành học mới"
 *     tags: [Admin - Majors]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Major' }
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.get('/majors', majorController.getAllMajors);

/**
 * @swagger
 * /api/admin/majors/{id}:
 *   get:
 *     summary: "[Admin] Xem chi tiết ngành"
 *     tags: [Admin - Majors]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Thành công
 *   put:
 *     summary: "[Admin] Cập nhật thông tin ngành"
 *     tags: [Admin - Majors]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Major' }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     summary: "[Admin Only] Xóa ngành học"
 *     tags: [Admin - Majors]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.get('/majors/:id', majorController.getMajorById);
router.post('/majors', majorController.createMajor);
router.put('/majors/:id', majorController.updateMajor);
router.delete('/majors/:id', checkRole(['Admin']), majorController.deleteMajor);

/**
 * @swagger
 * /api/admin/majors/{id}/statistics:
 *   get:
 *     summary: "[Admin] Lấy thống kê chi tiết của một ngành"
 *     tags: [Admin - Majors]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/majors/:id/statistics', majorController.getMajorStatistics);

const majorImageController = require('../controllers/majorImageController');
const majorUpload = require('../utils/majorUpload');

/**
 * @swagger
 * /api/admin/majors/{id}/images:
 *   post:
 *     summary: "[Admin] Upload hình ảnh cho ngành học"
 *     tags: [Admin - Majors]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items: { type: string, format: boolean }
 *     responses:
 *       201:
 *         description: Upload thành công
 */
router.post('/majors/:id/images', majorUpload.array('images', 20), majorImageController.uploadMajorImages);

/**
 * @swagger
 * /api/admin/images/{imageId}:
 *   delete:
 *     summary: "[Admin] Xóa hình ảnh của ngành theo ID"
 *     tags: [Admin - Majors]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/images/:imageId', majorImageController.deleteMajorImage);

/**
 * @swagger
 * /api/admin/images/{imageId}/order:
 *   patch:
 *     summary: "[Admin] Sắp xếp lại thứ tự hình ảnh"
 *     tags: [Admin - Majors]
 *     security: [ { bearerAuth: [] } ]
 */
router.patch('/images/:imageId/order', majorImageController.updateImageOrder);

/**
 * @swagger
 * /api/admin/faculties:
 *   get:
 *     summary: "[Admin] Lấy danh sách khoa"
 *     tags: [Admin - Faculties]
 *     security: [ { bearerAuth: [] } ]
 *   post:
 *     summary: "[Admin] Tạo khoa mới"
 *     tags: [Admin - Faculties]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       201:
 *         description: Thành công
 */
const facultyUpload = require('../utils/facultyUpload');
router.get('/faculties', facultyController.getAllFaculties);

/**
 * @swagger
 * /api/admin/faculties/{id}:
 *   get:
 *     summary: "[Admin] Xem chi tiết khoa"
 *     tags: [Admin - Faculties]
 *     security: [ { bearerAuth: [] } ]
 *   put:
 *     summary: "[Admin] Cập nhật khoa"
 *     tags: [Admin - Faculties]
 *     security: [ { bearerAuth: [] } ]
 *   delete:
 *     summary: "[Admin Only] Xóa khoa"
 *     tags: [Admin - Faculties]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/faculties/:id', facultyController.getFacultyById);
router.post('/faculties', facultyUpload.fields([{ name: 'logo_url', maxCount: 1 }, { name: 'banner_image_url', maxCount: 1 }]), facultyController.createFaculty);
router.put('/faculties/:id', facultyUpload.fields([{ name: 'logo_url', maxCount: 1 }, { name: 'banner_image_url', maxCount: 1 }]), facultyController.updateFaculty);
router.delete('/faculties/:id', checkRole(['Admin']), facultyController.deleteFaculty);

/**
 * @swagger
 * /api/admin/faculties/fix-slugs:
 *   post:
 *     summary: "[Admin Only] Tự động sửa lại slug cho các khoa"
 *     tags: [Admin - Faculties]
 *     security: [ { bearerAuth: [] } ]
 */
router.post('/faculties/fix-slugs', checkRole(['Admin']), facultyController.fixSlugs);

/**
 * @swagger
 * /api/admin/subject-groups:
 *   get:
 *     summary: "[Admin] Danh sách tổ hợp môn"
 *     tags: [Admin - Admissions]
 *     security: [ { bearerAuth: [] } ]
 *   post:
 *     summary: "[Admin] Tạo tổ hợp môn mới"
 *     tags: [Admin - Admissions]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/subject-groups', subjectGroupController.getAllSubjectGroups);

/**
 * @swagger
 * /api/admin/subject-groups/{id}:
 *   get:
 *     summary: "[Admin] Xem chi tiết tổ hợp môn"
 *     tags: [Admin - Admissions]
 *     security: [ { bearerAuth: [] } ]
 *   put:
 *     summary: "[Admin] Cập nhật tổ hợp môn"
 *     tags: [Admin - Admissions]
 *     security: [ { bearerAuth: [] } ]
 *   delete:
 *     summary: "[Admin Only] Xóa tổ hợp môn"
 *     tags: [Admin - Admissions]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/subject-groups/:id', subjectGroupController.getSubjectGroupById);
router.post('/subject-groups', subjectGroupController.createSubjectGroup);
router.put('/subject-groups/:id', subjectGroupController.updateSubjectGroup);
router.delete('/subject-groups/:id', subjectGroupController.deleteSubjectGroup);

/**
 * @swagger
 * /api/admin/admission-methods:
 *   get:
 *     summary: "[Admin] Danh sách phương thức tuyển sinh"
 *     tags: [Admin - Admissions]
 *     security: [ { bearerAuth: [] } ]
 *   post:
 *     summary: "[Admin] Tạo phương thức tuyển sinh"
 *     tags: [Admin - Admissions]
 *     security: [ { bearerAuth: [] } ]
 */
const methodUpload = require('../utils/methodUpload');
router.get('/admission-methods', admissionMethodController.getAllAdmissionMethods);

/**
 * @swagger
 * /api/admin/admission-methods/{id}:
 *   get:
 *     summary: "[Admin] Chi tiết phương thức"
 *     tags: [Admin - Admissions]
 *     security: [ { bearerAuth: [] } ]
 *   put:
 *     summary: "[Admin] Cập nhật phương thức"
 *     tags: [Admin - Admissions]
 *     security: [ { bearerAuth: [] } ]
 *   delete:
 *     summary: "[Admin Only] Xóa phương thức"
 *     tags: [Admin - Admissions]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/admission-methods/:id', admissionMethodController.getAdmissionMethodById);
router.post('/admission-methods', methodUpload.array('images', 20), admissionMethodController.createAdmissionMethod);
router.put('/admission-methods/:id', methodUpload.array('images', 20), admissionMethodController.updateAdmissionMethod);
router.delete('/admission-methods/:id', admissionMethodController.deleteAdmissionMethod);

/**
 * @swagger
 * /api/admin/historical-scores:
 *   get:
 *     summary: "[Admin] Danh sách điểm trúng tuyển"
 *     tags: [Admin - Admissions]
 *     security: [ { bearerAuth: [] } ]
 *   post:
 *     summary: "[Admin] Thêm điểm trúng tuyển mới"
 *     tags: [Admin - Admissions]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/historical-scores', historicalScoreController.getAllHistoricalScores);

/**
 * @swagger
 * /api/admin/historical-scores/{id}:
 *   get:
 *     summary: "[Admin] Chi tiết điểm theo ID"
 *     tags: [Admin - Admissions]
 *     security: [ { bearerAuth: [] } ]
 *   put:
 *     summary: "[Admin] Cập nhật điểm"
 *     tags: [Admin - Admissions]
 *     security: [ { bearerAuth: [] } ]
 *   delete:
 *     summary: "[Admin Only] Xóa bản ghi điểm"
 *     tags: [Admin - Admissions]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/historical-scores/:id', historicalScoreController.getHistoricalScoreById);
router.post('/historical-scores', historicalScoreController.createHistoricalScore);
router.put('/historical-scores/:id', historicalScoreController.updateHistoricalScore);
router.delete('/historical-scores/:id', historicalScoreController.deleteHistoricalScore);

/**
 * @swagger
 * /api/admin/historical-scores/calculate-threshold/{major_id}:
 *   get:
 *     summary: "[Admin] Tính toán ngưỡng điểm dự báo trúng tuyển"
 *     tags: [Admin - Admissions]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/historical-scores/calculate-threshold/:major_id', historicalScoreController.calculateThreshold);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: "[Admin Only] Danh sách người dùng hệ thống"
 *     tags: [Admin - Users]
 *     security: [ { bearerAuth: [] } ]
 *   post:
 *     summary: "[Admin Only] Tạo tài khoản người dùng mới"
 *     tags: [Admin - Users]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/users', checkRole(['Admin']), userController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/me:
 *   get:
 *     summary: "[Admin] Lấy thông tin cá nhân hiện tại"
 *     tags: [Admin - Users]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/users/me', userController.getCurrentUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: "[Admin] Xem chi tiết một người dùng"
 *     tags: [Admin - Users]
 *     security: [ { bearerAuth: [] } ]
 *   put:
 *     summary: "[Admin] Cập nhật thông tin người dùng"
 *     tags: [Admin - Users]
 *     security: [ { bearerAuth: [] } ]
 *   delete:
 *     summary: "[Admin Only] Xóa tài khoản người dùng"
 *     tags: [Admin - Users]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/users/:id', userController.getUserById);
router.post('/users', checkRole(['Admin']), userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', checkRole(['Admin']), userController.deleteUser);

/**
 * @swagger
 * /api/admin/users/{id}/change-password:
 *   patch:
 *     summary: "[Admin] Đổi mật khẩu cho người dùng"
 *     tags: [Admin - Users]
 *     security: [ { bearerAuth: [] } ]
 */
router.patch('/users/:id/change-password', userController.changePassword);

/**
 * @swagger
 * /api/admin/users/{id}/lock:
 *   patch:
 *     summary: "[Admin Only] Khóa tài khoản người dùng"
 *     tags: [Admin - Users]
 *     security: [ { bearerAuth: [] } ]
 */
router.patch('/users/:id/lock', checkRole(['Admin']), userController.lockUser);

/**
 * @swagger
 * /api/admin/users/{id}/unlock:
 *   patch:
 *     summary: "[Admin Only] Mở khóa tài khoản người dùng"
 *     tags: [Admin - Users]
 *     security: [ { bearerAuth: [] } ]
 */
router.patch('/users/:id/unlock', checkRole(['Admin']), userController.unlockUser);

/**
 * @swagger
 * /api/admin/users/{id}/assign-role:
 *   patch:
 *     summary: "[Admin Only] Gán vai trò (Role) cho người dùng"
 *     tags: [Admin - Users]
 *     security: [ { bearerAuth: [] } ]
 */
router.patch('/users/:id/assign-role', checkRole(['Admin']), userController.assignRole);

/**
 * @swagger
 * /api/admin/roles:
 *   get:
 *     summary: "[Admin Only] Danh sách các vai trò"
 *     tags: [Admin - Users]
 *     security: [ { bearerAuth: [] } ]
 *   post:
 *     summary: "[Admin Only] Tạo vai trò mới"
 *     tags: [Admin - Users]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/roles', roleController.getAllRoles);

/**
 * @swagger
 * /api/admin/roles/{id}:
 *   get:
 *     summary: "[Admin Only] Chi tiết vai trò"
 *     tags: [Admin - Users]
 *     security: [ { bearerAuth: [] } ]
 *   put:
 *     summary: "[Admin Only] Cập nhật vai trò"
 *     tags: [Admin - Users]
 *     security: [ { bearerAuth: [] } ]
 *   delete:
 *     summary: "[Admin Only] Xóa vai trò"
 *     tags: [Admin - Users]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/roles/:id', roleController.getRoleById);
router.post('/roles', roleController.createRole);
router.put('/roles/:id', roleController.updateRole);
router.delete('/roles/:id', roleController.deleteRole);

/**
 * @swagger
 * /api/admin/posts:
 *   get:
 *     summary: "[Admin] Danh sách tất cả bài viết"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   post:
 *     summary: "[Admin] Tạo bài viết mới"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/posts', postController.getAllPosts);

/**
 * @swagger
 * /api/admin/posts/{id}:
 *   get:
 *     summary: "[Admin] Chi tiết bài viết"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   put:
 *     summary: "[Admin] Cập nhật bài viết"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   delete:
 *     summary: "[Admin] Xóa bài viết"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/posts/:id', postController.getPostById);
router.post('/posts', upload.single('image_url'), postController.createPost);
router.put('/posts/:id', upload.single('image_url'), postController.updatePost);
router.delete('/posts/:id', postController.deletePost);

/**
 * @swagger
 * /api/admin/posts/{id}/publish:
 *   patch:
 *     summary: "[Admin] Xuất bản bài viết"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 */
router.patch('/posts/:id/publish', postController.publishPost);

/**
 * @swagger
 * /api/admin/posts/{id}/unpublish:
 *   patch:
 *     summary: "[Admin] Gỡ bài viết (chuyển về nháp)"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 */
router.patch('/posts/:id/unpublish', postController.unpublishPost);

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: "[Admin] Danh sách danh mục bài viết"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   post:
 *     summary: "[Admin] Tạo danh mục mới"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/categories', categoryController.getAllCategories);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   get:
 *     summary: "[Admin] Chi tiết danh mục"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   put:
 *     summary: "[Admin] Cập nhật danh mục"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   delete:
 *     summary: "[Admin] Xóa danh mục"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/categories/:id', categoryController.getCategoryById);
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

/**
 * @swagger
 * /api/admin/chat-sessions:
 *   get:
 *     summary: "[Admin] Danh sách phiên chat"
 *     tags: [Admin - Systems]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/chat-sessions', chatController.getAllChatSessions);

/**
 * @swagger
 * /api/admin/chat-sessions/{id}:
 *   get:
 *     summary: "[Admin] Chi tiết tin nhắn trong phiên chat"
 *     tags: [Admin - Systems]
 *     security: [ { bearerAuth: [] } ]
 *   delete:
 *     summary: "[Admin] Xóa phiên chat"
 *     tags: [Admin - Systems]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/chat-sessions/:id', chatController.getChatSessionById);

/**
 * @swagger
 * /api/admin/chat-sessions/cleanup/old:
 *   delete:
 *     summary: "[Admin Only] Dọn dẹp các phiên chat cũ (>30 ngày)"
 *     tags: [Admin - Systems]
 *     security: [ { bearerAuth: [] } ]
 */
router.delete('/chat-sessions/:id', chatController.deleteChatSession);
router.delete('/chat-sessions/cleanup/old', chatController.cleanupOldSessions);

/**
 * @swagger
 * /api/admin/chat/statistics:
 *   get:
 *     summary: "[Admin] Thống kê hiệu suất Chatbot"
 *     tags: [Admin - Systems]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/chat/statistics', chatController.getChatStatistics);






/**
 * @swagger
 * /api/admin/major-subject-mappings:
 *   get:
 *     summary: "[Admin] Lấy danh sách liên kết Ngành - Tổ hợp"
 *     tags: [Admin - Mappings]
 *     security: [ { bearerAuth: [] } ]
 *   post:
 *     summary: "[Admin] Tạo liên kết mới"
 *     tags: [Admin - Mappings]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/major-subject-mappings', majorSubjectMappingController.getAllMappings);

/**
 * @swagger
 * /api/admin/major-subject-mappings/{major_id}/{subject_group_id}:
 *   get:
 *     summary: "[Admin] Xem chi tiết một liên kết"
 *     tags: [Admin - Mappings]
 *     security: [ { bearerAuth: [] } ]
 *   delete:
 *     summary: "[Admin] Xóa một liên kết"
 *     tags: [Admin - Mappings]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/major-subject-mappings/:major_id/:subject_group_id', majorSubjectMappingController.getMappingById);

/**
 * @swagger
 * /api/admin/majors/{major_id}/subject-groups:
 *   get:
 *     summary: "[Admin] Lấy danh sách tổ hợp môn của một ngành"
 *     tags: [Admin - Mappings]
 *     security: [ { bearerAuth: [] } ]
 *   put:
 *     summary: "[Admin] Thay thế toàn bộ tổ hợp môn của ngành"
 *     tags: [Admin - Mappings]
 *     security: [ { bearerAuth: [] } ]
 *   delete:
 *     summary: "[Admin] Xóa toàn bộ tổ hợp môn của ngành"
 *     tags: [Admin - Mappings]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/majors/:major_id/subject-groups', majorSubjectMappingController.getSubjectGroupsByMajor);
router.delete('/majors/:major_id/subject-groups', majorSubjectMappingController.deleteAllMappingsByMajor);
router.put('/majors/:major_id/subject-groups', majorSubjectMappingController.replaceMajorSubjectGroups);

/**
 * @swagger
 * /api/admin/subject-groups/{subject_group_id}/majors:
 *   get:
 *     summary: "[Admin] Lấy danh sách ngành của một tổ hợp môn"
 *     tags: [Admin - Mappings]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/subject-groups/:subject_group_id/majors', majorSubjectMappingController.getMajorsBySubjectGroup);

router.post('/major-subject-mappings', majorSubjectMappingController.createMapping);
router.delete('/major-subject-mappings/:major_id/:subject_group_id', majorSubjectMappingController.deleteMapping);

/**
 * @swagger
 * /api/admin/major-subject-mappings/bulk-create:
 *   post:
 *     summary: "[Admin] Tạo liên kết số lượng lớn"
 *     tags: [Admin - Mappings]
 *     security: [ { bearerAuth: [] } ]
 */
router.post('/major-subject-mappings/bulk-create', majorSubjectMappingController.bulkCreateMappings);

/**
 * @swagger
 * /api/admin/major-subject-mappings/statistics:
 *   get:
 *     summary: "[Admin] Thống kê liên kết"
 *     tags: [Admin - Mappings]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/major-subject-mappings/statistics', majorSubjectMappingController.getMappingStatistics);

const specializationController = require('../controllers/specializationController');
/**
 * @swagger
 * /api/admin/specializations:
 *   get:
 *     summary: "[Admin] Danh sách chuyên ngành"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   post:
 *     summary: "[Admin] Tạo chuyên ngành mới"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/specializations', specializationController.getAllSpecializations);

/**
 * @swagger
 * /api/admin/specializations/{id}:
 *   get:
 *     summary: "[Admin] Chi tiết chuyên ngành"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   put:
 *     summary: "[Admin] Cập nhật chuyên ngành"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   delete:
 *     summary: "[Admin] Xóa chuyên ngành"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/specializations/:id', specializationController.getSpecializationById);
router.post('/specializations', specializationController.createSpecialization);
router.put('/specializations/:id', specializationController.updateSpecialization);
router.delete('/specializations/:id', specializationController.deleteSpecialization);

/**
 * @swagger
 * /api/admin/news:
 *   get:
 *     summary: "[Admin] Danh sách tin tức"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   post:
 *     summary: "[Admin] Tạo tin tức mới"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 */
const newsController = require('../controllers/newsController');
router.get('/news', newsController.getAllNews);

/**
 * @swagger
 * /api/admin/news/{id}:
 *   get:
 *     summary: "[Admin] Chi tiết tin tức"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   put:
 *     summary: "[Admin] Cập nhật tin tức"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   delete:
 *     summary: "[Admin] Xóa tin tức"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/news/:id', newsController.getNewsById);
router.post('/news', upload.single('featured_image'), newsController.createNews);
router.put('/news/:id', upload.single('featured_image'), newsController.updateNews);
router.delete('/news/:id', newsController.deleteNews);

/**
 * @swagger
 * /api/admin/events:
 *   get:
 *     summary: "[Admin] Danh sách sự kiện"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   post:
 *     summary: "[Admin] Tạo sự kiện mới"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 */
const eventController = require('../controllers/eventController');
router.get('/events', eventController.getAllEvents);

/**
 * @swagger
 * /api/admin/events/{id}:
 *   get:
 *     summary: "[Admin] Chi tiết sự kiện"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   put:
 *     summary: "[Admin] Cập nhật sự kiện"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   delete:
 *     summary: "[Admin] Xóa sự kiện"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/events/:id', eventController.getEventById);
router.post('/events', upload.single('image'), eventController.createEvent);
router.put('/events/:id', upload.single('image'), eventController.updateEvent);
router.delete('/events/:id', eventController.deleteEvent);

/**
 * @swagger
 * /api/admin/banners:
 *   get:
 *     summary: "[Admin] Danh sách Banner"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   post:
 *     summary: "[Admin] Tạo Banner mới"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 */
const bannerController = require('../controllers/bannerController');
router.get('/banners', bannerController.getAllBanners);

/**
 * @swagger
 * /api/admin/banners/{id}:
 *   get:
 *     summary: "[Admin] Chi tiết Banner"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   put:
 *     summary: "[Admin] Cập nhật Banner"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   delete:
 *     summary: "[Admin] Xóa Banner"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/banners/:id', bannerController.getBannerById);
router.post('/banners', upload.single('image_url'), bannerController.createBanner);
router.put('/banners/:id', upload.single('image_url'), bannerController.updateBanner);
router.delete('/banners/:id', bannerController.deleteBanner);

/**
 * @swagger
 * /api/admin/banners/{id}/order:
 *   patch:
 *     summary: "[Admin] Sắp xếp lại thứ tự Banner"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 */
router.patch('/banners/:id/order', bannerController.updateBannerOrder);

/**
 * @swagger
 * /api/admin/scholarships:
 *   get:
 *     summary: "[Admin] Danh sách học bổng"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   post:
 *     summary: "[Admin] Thêm học bổng mới"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 */
const scholarshipController = require('../controllers/scholarshipController');
router.get('/scholarships', scholarshipController.getAllScholarships);

/**
 * @swagger
 * /api/admin/scholarships/{id}:
 *   get:
 *     summary: "[Admin] Chi tiết học bổng"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   put:
 *     summary: "[Admin] Cập nhật học bổng"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   delete:
 *     summary: "[Admin] Xóa học bổng"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/scholarships/:id', scholarshipController.getScholarshipById);
router.post('/scholarships', upload.array('images', 20), scholarshipController.createScholarship);
router.put('/scholarships/:id', upload.array('images', 20), scholarshipController.updateScholarship);
router.delete('/scholarships/:id', scholarshipController.deleteScholarship);


/**
 * @swagger
 * /api/admin/training-types:
 *   get:
 *     summary: "[Admin] Danh sách hệ đào tạo"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   post:
 *     summary: "[Admin] Tạo hệ đào tạo mới"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 */
const trainingTypeController = require('../controllers/trainingTypeController');
router.get('/training-types', trainingTypeController.getAllTrainingTypes);

/**
 * @swagger
 * /api/admin/training-types/{id}:
 *   get:
 *     summary: "[Admin] Chi tiết hệ đào tạo"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   put:
 *     summary: "[Admin] Cập nhật hệ đào tạo"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 *   delete:
 *     summary: "[Admin Only] Xóa hệ đào tạo"
 *     tags: [Admin - Content]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/training-types/:id', trainingTypeController.getTrainingTypeById);
router.post('/training-types', trainingTypeUpload.array('images', 20), trainingTypeController.createTrainingType);
router.put('/training-types/:id', trainingTypeUpload.array('images', 20), trainingTypeController.updateTrainingType);
router.delete('/training-types/:id', checkRole(['Admin']), trainingTypeController.deleteTrainingType);


/**
 * @swagger
 * /api/admin/stats/dashboard:
 *   get:
 *     summary: "[Admin] Thống kê tổng quan"
 *     tags: [Admin - Systems]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/stats/dashboard', statisticsController.getDashboardStats);

/**
 * @swagger
 * /api/admin/stats/majors:
 *   get:
 *     summary: "[Admin] Thống kê theo ngành học"
 *     tags: [Admin - Systems]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/stats/majors', statisticsController.getMajorStats);

/**
 * @swagger
 * /api/admin/stats/chatbot:
 *   get:
 *     summary: "[Admin] Thống kê chi tiết tin nhắn"
 *     tags: [Admin - Systems]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/stats/chatbot', statisticsController.getChatbotStatistics);

/**
 * @swagger
 * /api/admin/stats/export-pdf:
 *   get:
 *     summary: "[Admin] Xuất báo cáo PDF"
 *     tags: [Admin - Systems]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/stats/export-pdf', statisticsController.exportDashboardPDF);

/**
 * @swagger
 * /api/admin/stats/export-pdf:
 *   get:
 *     summary: "[Admin] Xuất báo cáo PDF"
 *     tags: [Admin - Systems]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/stats/export-pdf', statisticsController.exportDashboardPDF);

/**
 * @swagger
 * /api/admin/chat-data/ingest:
 *   post:
 *     summary: "[Admin Only] Nạp dữ liệu vào bộ nhớ AI (RAG)"
 *     tags: [Admin - Systems]
 *     security: [ { bearerAuth: [] } ]
 */
router.post('/chat-data/ingest', checkRole(['Admin']), ragController.ingestData);

/**
 * @swagger
 * /api/admin/chat-data:
 *   get:
 *     summary: "[Admin] Xem kho tri thức RAG"
 *     tags: [Admin - Systems]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/chat-data', checkRole(['Admin']), ragController.getAllKnowledge);

/**
 * @swagger
 * /api/admin/chat-data/{id}:
 *   put:
 *     summary: "[Admin] Cập nhật tri thức RAG"
 *     tags: [Admin - Systems]
 *     security: [ { bearerAuth: [] } ]
 *   delete:
 *     summary: "[Admin Only] Xóa tri thức RAG"
 *     tags: [Admin - Systems]
 *     security: [ { bearerAuth: [] } ]
 */
router.put('/chat-data/:id', checkRole(['Admin']), ragController.updateKnowledge);
router.delete('/chat-data/:id', checkRole(['Admin']), ragController.deleteKnowledge);

module.exports = router;
