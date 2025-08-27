const router = require("express").Router();
const userController = require("../controllers/userController");

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: 유저 개인정보 조회
 *     description: 유저의 개인정보를 반환합니다. 토큰이 필수입니다.
 *     tags: [users]
 *     security:
 *       bearerAuth: []
 *     responses:
 *       200:
 *         description: 유저의 개인정보를 반환합니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/UserResponse'
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.get("/me", userController.getUserData);

/**
 * @swagger
 * /api/v1/users/me:
 *   put:
 *     summary: 비밀번호를 제외한 유저 개인정보 수정
 *     description: 유저 데이터의 새로운 정보를 입력 받아 수정합니다. 토큰이 필수입니다.
 *     tags: [users]
 *     security:
 *       bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 example: 씀씀이용자
 *               birth:
 *                 type: string
 *                 format: date
 *                 example: 2005-12-25
 *               gender:
 *                 type: string
 *                 example: 남
 *
 *     responses:
 *       200:
 *         description: 개인정보 수정이 성공적으로 되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/UserResponse'
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.put("/me", userController.updateUserData);

/**
 * @swagger
 * /api/v1/users/me/password:
 *   post:
 *     summary: 비밀번호 체크
 *     description: 유저의 비밀번호를 통해 사용자 인증을 진행합니다. 토큰이 필수입니다.
 *     tags: [users]
 *     security:
 *       bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               confirmPassword:
 *                 type: string
 *                 description: 기존 비밀번호
 *                 example: 1q2w3e4r!
 *     responses:
 *       200:
 *         description: 비밀번호 인증 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                  type: string
 *                  example: 비밀번호 인증 성공
 *
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.post("/me/password", userController.verifyPassword);

/**
 * @swagger
 * /api/v1/users/me/password:
 *   put:
 *     summary: 비밀번호 수정
 *     description:
 *     tags: [users]
 *     security:
 *       bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *              - password
 *             properties:
 *               newPassword:
 *                 type: string
 *                 description: 새로운 비밀번호
 *                 example: 1q2w3e4r!
 *               confirmNewPassword:
 *                 type: string
 *                 description: 새로운 비밀번호 확인
 *                 example: 1q2w3e4r!
 *     responses:
 *       200:
 *         description:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                  type: string
 *                  example: 비밀번호 수정 성공
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.put("/me/password", userController.updatePassword);

module.exports = router;
