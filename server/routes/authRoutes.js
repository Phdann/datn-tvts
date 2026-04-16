const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerAdmin, registerCandidate } = require('../controllers/registerController');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API cho việc xác thực và đăng ký
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập vào hệ thống
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       401:
 *         description: Sai email hoặc mật khẩu
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/register-admin:
 *   post:
 *     summary: Đăng ký tài khoản Admin (Chỉ dùng cho khởi tạo hoặc môi trường dev)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo tài khoản thành công
 */
router.post('/register-admin', registerAdmin);

/**
 * @swagger
 * /api/auth/register-candidate:
 *   post:
 *     summary: Đăng ký tài khoản Thí sinh
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 */
router.post('/register-candidate', registerCandidate);

module.exports = router;
