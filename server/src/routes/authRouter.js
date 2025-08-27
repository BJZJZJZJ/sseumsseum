const router = require("express").Router();
const authController = require("../controllers/authController");
const {
  validateUserCreate,
  validateLogin,
  validationRefreshToken,
  validateResendMail,
  validateVerifyEmail,
  validationHandler,
} = require("../middleware/validator/authValidator");
const { RESEND_LIMIT } = require("../middleware/rateLimit");

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: 회원가입 -이메일 인증 추가 예정-
 *     description: 이메일와 비밀번호 및 개인정보를 입력받아 회원가입을 진행합니다.
 *     tags: [(O) auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *
 *     responses:
 *       201:
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
 *       409:
 *         $ref: '#/components/error/EmailDuplicationError'
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
 *     tags: [(O) auth]
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
 *       201:
 *         description: 성공적으로 로그인이 진행되었습니다. 액세스 토큰과 리프래시 토큰을 반환합니다.
 *         headers:
 *           Set-Cookie:
 *             description: RefreshToken 쿠키
 *             schema:
 *               type: string
 *               example: "refreshToken=eyJhbGciOiJIUzI1NiI...; HttpOnly; Secure; SameSite=Strict"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 로그인 성공했습니다.
 *                 newAccessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInRTEeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UserAuthizedError'
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
 *     tags: [(O) auth]
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
router.post(
  "/logout",
  validationRefreshToken,
  validationHandler,
  authController.logout
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: 토큰 갱신 (Refresh + Access)
 *     description: 사용자의 토큰을 갱신합니다. 리프래시 토큰이 필수입니다.
 *     tags: [(O) auth]
 *     security:
 *       bearerAuth: []
 *     responses:
 *       201:
 *         description: 토큰이 갱신 되었습니다.
 *         headers:
 *           Set-Cookie:
 *             description: RefreshToken 쿠키
 *             schema:
 *               type: string
 *               example: "refreshToken=eyJhbGciOiJIUzI1NiI...; HttpOnly; Secure; SameSite=Strict"
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
router.post(
  "/refresh",
  validationRefreshToken,
  validationHandler,
  authController.updateToken
);

/**
 * @swagger
 * /api/v1/auth/resend:
 *   post:
 *     summary: 인증 메일 재전송
 *     description: 사용자의 인증 메일을 재전송합니다. 이메일이 필수입니다.
 *     tags: [(O) auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            required:
 *             - email
 *            properties:
 *             email:
 *              type: string
 *              description: 사용자 이메일
 *              example: asdf223@test.com
 *     responses:
 *       200:
 *         description: 인증 메일이 전송되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 인증 메일이 전송되었습니다.
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       404:
 *         $ref: '#/components/error/UserNotFoundError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.post(
  "/resend",
  RESEND_LIMIT,
  validateResendMail,
  validationHandler,
  authController.resendMail
);

/**
 * @swagger
 * /api/v1/auth/verify:
 *   get:
 *     summary: 이메일 인증
 *     description: 사용자의 이메일을 인증합니다. 토큰과 이메일이 필수입니다.
 *     tags: [(O) auth]
 *     parameters:
 *      - in: query
 *        name: token
 *        required: true
 *        schema:
 *          type: string
 *          required: trueq
 *          description: 인증 토큰
 *      - in: query
 *        name: email
 *        required: true
 *        schema:
 *          type: string
 *          required: true
 *          description: 사용자 이메일
 *          example: teset12@test.com
 *
 *     responses:
 *       200:
 *         description: 이메일 인증에 성공했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 인증 성공했습니다.
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       404:
 *         $ref: '#/components/error/UserNotFoundError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.get(
  "/verify",
  validateVerifyEmail,
  validationHandler,
  authController.verifyEmail
);

module.exports = router;
