const router = require("express").Router();
const budgetController = require("../controllers/budgetController");

/**
 * @swagger
 * /api/v1/budgets/:
 *   get:
 *     summary: 예산 조회
 *     description: 이용자의 예산을 조회합니다. 토큰이 필수입니다.
 *     tags: [budgets]
 *     security:
 *       bearerAuth: []
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
 *       403:
 *         $ref: '#/components/error/ForbiddenError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.get("/", budgetController);

/**
 * @swagger
 * /api/v1/budgets/:
 *   post:
 *     summary: 예산 생성
 *     description: 이용자의 월 예산을 생성합니다. 토큰이 필수입니다.
 *     tags: [budgets]
 *     security:
 *       bearerAuth: []
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
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.post("/", budgetController);

/**
 * @swagger
 * /api/v1/budgets/{id}:
 *   put:
 *     summary: 예산 수정
 *     description: 이용자의 예산을 수정합니다. 토큰이 필수입니다.
 *     tags: [budgets]
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        example: 60c72b2f9b1e8d3f4c8b4567
 *        description: 예산의 ID
 *     security:
 *       bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Budget'
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
 *       403:
 *         $ref: '#/components/error/ForbiddenError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.put("/{id}", budgetController);

/**
 * @swagger
 * /api/v1/budgets/{id}:
 *   delete:
 *     summary: 예산 삭제
 *     description: 이용자의 예산을 삭제합니다. 토큰이 필수입니다.
 *     tags: [budgets]
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        example: 60c72b2f9b1e8d3f4c8b4567
 *        description: 예산의 ID
 *     security:
 *       bearerAuth: []
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
 *       403:
 *         $ref: '#/components/error/ForbiddenError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.delete("/{id}", budgetController);

module.exports = router;
