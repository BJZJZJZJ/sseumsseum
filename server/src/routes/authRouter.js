const router = require("express").Router();
const authController = require("../controllers/authController");
const {
  validateUserCreate,
  validateLogin,
  validationHandler,
} = require("../middleware/validator/authValidator");

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: 회원가입
 *     description: 이메일와 비밀번호 및 개인정보를 입력받아 회원가입을 진행합니다.
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *
 *     responses:
 *       200:
 *         description: 성공적으로 회원가입이 진행되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 회원가입이 성공했습니다.
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.post(
  "/register",
  validateUserCreate,
  validationHandler,
  authController.createUser
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: 로그인
 *     description: 이메일와 비밀번호를 입력받아 로그인을 진행합니다. 성공 시 JWT 토큰을 반환합니다.
 *     tags: [auth]
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
 *                 description: 사용자 이메일
 *                 example: testemail@google.com
 *               password:
 *                 type: string
 *                 description: 사용자 비밀번호
 *                 example: 1q2w3e4r!
 *
 *     responses:
 *       200:
 *         description: 성공적으로 로그인이 진행되었습니다. 액세스 토큰과 리프래시 토큰을 반환합니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 로그인 성공했습니다.
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInRTEeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *                 refreshToken:
 *                   type: string
 *                   example: eKKF2QT4fwpMeJf36POk6yJV_adQssw5cwpMeJf36POk6yJV_adQssw5c
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.post("/login", validateLogin, validationHandler, authController.login);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     description: 사용자의 로그아웃을 처리합니다. 토큰이 필수입니다.
 *     tags: [auth]
 *     security:
 *       bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃이 성공했습니다. 토큰을 파기합니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 로그아웃 되었습니다.
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.post("/logout", authController.logout);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: 액세스 토큰 갱신
 *     description: 사용자의 액세스 토큰을 갱신합니다. 리프래시 토큰이 필수입니다.
 *     tags: [auth]
 *     security:
 *       bearerAuth: []
 *     responses:
 *       200:
 *         description: 액세스 토큰이 갱신 되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 액세스 토큰 갱신 성공에 성공했습니다.
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInRTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.post("/refresh", authController.updateToken);

module.exports = router;
