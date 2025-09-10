const router = require("express").Router();
const categoryController = require("../controllers/categoryController");

const { verifyAccessToken } = require("../middleware/authMiddleware");
const categoryValidator = require("../middleware/validator/categoryValidator");

/**
 * @swagger
 * /api/v1/categories/:
 *   get:
 *     summary: 카테고리 조회
 *     description: 이용자가 소유한 카테고리 목록을 조회합니다. 토큰이 필수입니다.
 *     tags: [(O) categories]
 *     parameters:
 *      - $ref: '#/components/parameters/AccessTokenHeader'
 *      - $ref: '#/components/parameters/PageQuery'
 *      - $ref: '#/components/parameters/LimitQuery'
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
 *       404:
 *         $ref: '#/components/error/NotFoundError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.get(
  "/",
  categoryValidator.get,
  verifyAccessToken,
  categoryController.getCategories
);

/**
 * @swagger
 * /api/v1/categories/:
 *   post:
 *     summary: 카테고리 생성
 *     description: 이용자의 카테고리를 생성합니다. 토큰이 필수입니다.
 *     tags: [(O) categories]
 *     parameters:
 *       - $ref: '#/components/parameters/AccessTokenHeader'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
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
router.post(
  "/",
  categoryValidator.post,
  verifyAccessToken,
  categoryController.createCategory
);

/**
 * @swagger
 * /api/v1/categories/:id:
 *   put:
 *     summary: 카테고리 수정
 *     description: 이용자의 카테고리를 수정합니다. 토큰이 필수입니다.
 *     tags: [(O) categories]
 *     parameters:
 *      - $ref: '#/components/parameters/AccessTokenHeader'
 *      - in: path
 *        name: id
 *        required: true
 *        description: 카테고리 ID
 *        schema:
 *          type: string
 *          example: 60c72b2f9b1e8d3f4c8b4567
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
router.put(
  "/:id",
  categoryValidator.update,
  verifyAccessToken,
  categoryController.updateCategory
);

/**
 * @swagger
 * /api/v1/categories/:id:
 *   delete:
 *     summary: 카테고리 삭제
 *     description: 이용자의 카테고리를 삭제합니다. 토큰이 필수입니다.
 *     tags: [(O) categories]
 *     parameters:
 *      - $ref: '#/components/parameters/AccessTokenHeader'
 *      - in: path
 *        name: id
 *        required: true
 *        description: 카테고리 ID
 *        schema:
 *          type: string
 *          example: 60c72b2f9b1e8d3f4c8b4567
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
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       403:
 *         $ref: '#/components/error/ForbiddenError'
 *       404:
 *         $ref: '#/components/error/NotFoundError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.delete(
  "/:id",
  categoryValidator.delete,
  verifyAccessToken,
  categoryController.deleteCategory
);

module.exports = router;
