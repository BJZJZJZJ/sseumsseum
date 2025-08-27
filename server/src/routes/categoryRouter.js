const router = require("express").Router();
const categoryController = require("../controllers/categoryController");

/**
 * @swagger
 * /api/v1/categories/:
 *   get:
 *     summary: 카테고리 조회
 *     description: 이용자가 소유한 카테고리 목록을 조회합니다. 토큰이 필수입니다.
 *     tags: [categories]
 *     parameters:
 *      - in: query
 *        name: q
 *        required: false
 *        example: 식비
 *        description: '검색어 (예: 식비, 교통비 등)'
 *     security:
 *       bearerAuth: []
 *     responses:
 *       200:
 *         description: 이용자가 소유한 카테고리 목록을 반환합니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/responses/CategoryResponse'
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       403:
 *         $ref: '#/components/error/ForbiddenError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.get("/", categoryController);

/**
 * @swagger
 * /api/v1/categories/:
 *   post:
 *     summary: 카테고리 생성
 *     description: 이용자의 카테고리를 생성합니다. 토큰이 필수입니다.
 *     tags: [categories]
 *     security:
 *       bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: 카테고리가 성공적으로 생성되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/CategoryResponse'
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.post("/", categoryController);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     summary: 카테고리 수정
 *     description: 이용자의 카테고리를 수정합니다. 토큰이 필수입니다.
 *     tags: [categories]
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        example: 60c72b2f9b1e8d3f4c8b4567
 *        description: 카테고리의 ID
 *     security:
 *       bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: 카테고리가 성공적으로 수정되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/CategoryResponse'
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       403:
 *         $ref: '#/components/error/ForbiddenError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.put("/{id}", categoryController);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: 카테고리 삭제
 *     description: 이용자의 카테고리를 삭제합니다. 토큰이 필수입니다.
 *     tags: [categories]
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        example: 60c72b2f9b1e8d3f4c8b4567
 *        description: 카테고리의 ID
 *     security:
 *       bearerAuth: []
 *     responses:
 *       200:
 *         description: 카테고리가 성공적으로 삭제되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 카테고리가 성공적으로 삭제되었습니다.
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       403:
 *         $ref: '#/components/error/ForbiddenError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.delete("/{id}", categoryController);

module.exports = router;
