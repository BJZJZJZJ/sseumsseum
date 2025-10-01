const router = require("express").Router();
const budgetController = require("../controllers/budgetController");
const { verifyAccessToken } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /api/v1/budgets:
 *   get:
 *     summary: 예산 조회
 *     description: 이용자의 예산을 조회합니다. 토큰이 필수입니다.
 *     tags: [budgets]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: header
 *        name: Authorization
 *        required: true
 *        schema:
 *          type: string
 *          description: Bearer {access_token}
 *          example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e
 *      - in: query
 *        name: month
 *        required: true
 *        example: 2025-09
 *        description: "조회할 예산의 월 (형식: YYYY-MM)"
 *     responses:
 *       200:
 *         description: 이용자가 소유한 예산 목록을 반환합니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/responses/BudgetResponse'
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.get("/", verifyAccessToken, budgetController.getBudget);

/**
 * @swagger
 * /api/v1/budgets:
 *   post:
 *     summary: 예산 생성
 *     description: 이용자의 월 예산을 생성합니다. 카테고리는 대분류 카테고리를 이용합니다. 토큰이 필수입니다.
 *     tags: [budgets]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - $ref: '#/components/parameters/AccessTokenHeader'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Budget'
 *     responses:
 *       200:
 *         description: 예산이 성공적으로 생성되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BudgetResponse'
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       409:
 *         $ref: '#/components/error/DuplicationError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.post("/", verifyAccessToken, budgetController.createBudget);

/**
 * @swagger
 * /api/v1/budgets/:
 *   put:
 *     summary: 예산 수정
 *     description: 이용자의 예산을 수정합니다. 토큰이 필수입니다.
 *     tags: [budgets]
 *     parameters:
 *      - $ref: '#/components/parameters/AccessTokenHeader'
 *      - in: path
 *        name: id
 *        required: true
 *        example: 60c72b2f9b1e8d3f4c8b4567
 *        description: 예산 ID
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     categoryId:
 *                       type: string
 *                       description: 카테고리 ID
 *                       example: 5a76gfq23raf6glkaef
 *                     amount:
 *                       type: number
 *                       description: 카테고리별 예산 금액
 *                       example: 2000000
 *     responses:
 *       200:
 *         description: 예산이 성공적으로 수정되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BudgetResponse'
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       404:
 *         $ref: '#/components/error/NotFoundError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.put("/:id", verifyAccessToken, budgetController.updateBudget);

/**
 * @swagger
 * /api/v1/budgets/:
 *   delete:
 *     summary: 예산 삭제
 *     description: 이용자의 예산을 삭제합니다. 토큰이 필수입니다.
 *     tags: [budgets]
 *     parameters:
 *      - $ref: '#/components/parameters/AccessTokenHeader'
 *      - in: path
 *        name: id
 *        required: true
 *        example: 60c72b2f9b1e8d3f4c8b4567
 *        description: 예산의 ID
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: 예산이 성공적으로 삭제되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 예산이 성공적으로 삭제되었습니다.
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       404:
 *         $ref: '#/components/error/NotFoundError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.delete("/:id", verifyAccessToken, budgetController.deleteBudget);

/**
 * @swagger
 * /api/v1/budgets/report:
 *   get:
 *     summary: 예산 리포트 조회
 *     description: 이용자의 예산과 지출 내역을 비교한 리포트를 조회합니다. 토큰이 필수입니다.
 *     tags: [budgets]
 *     parameters:
 *      - $ref: '#/components/parameters/AccessTokenHeader'
 *      - in: query
 *        name: month
 *        required: true
 *        example: 2025-09
 *        description: "조회할 예산의 월 (형식: YYYY-MM)"
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: 예산 조회에 성공했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 예산 보고서 조회가 완료되었습니다.
 *                 id:
 *                   type: string
 *                   description: 예산 ID
 *                 month:
 *                   type: string
 *                   description: 예산 월
 *                   example: "2023-10"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       categoryId:
 *                         type: string
 *                         description: 카테고리 ID
 *                         example: 5a76gfq23raf6glkaef
 *                       categoryName:
 *                         type: string
 *                         description: 카테고리 이름
 *                         example: 식비
 *                       totalBudget:
 *                         type: number
 *                         description: 카테고리별 예산 금액
 *                         example: 2000000
 *                       totalSpent:
 *                         type: number
 *                         description: 카테고리별 지출 금액
 *                         example: 1500000
 *                       remaining:
 *                         type: number
 *                         description: 카테고리별 잔여 금액
 *                         example: 500000
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       403:
 *         $ref: '#/components/error/ForbiddenError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.get("/report", verifyAccessToken, budgetController.getBudgetReport);

module.exports = router;
