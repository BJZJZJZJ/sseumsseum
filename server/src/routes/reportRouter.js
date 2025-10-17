const router = require("express").Router();
const reportController = require("../controllers/reportController");
const { verifyAccessToken } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /api/reports/:
 *   get:
 *     summary: 재무 추이 보고서 조회
 *     tags: [Reports]
 *     description: |
 *       지정된 기간 동안의 재무 추이 보고서를 제공합니다.
 *       - `type=yearly` → 연간 집계 (월 단위)
 *       - `type=monthly` → 월간 집계 (월 단위)
 *       - 카테고리별 요약과 총 수입/지출/순이익을 포함합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AccessTokenHeader'
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [monthly, yearly]
 *         required: true
 *         description: 보고서 유형 (monthly, yearly)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: 조회 시작일
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: 조회 종료일
 *     responses:
 *       '200':
 *         description: 재무 추이 보고서 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 재무 추이 보고서 조회 완료
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   example: 2025-01-01
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   example: 2025-12-31
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalIncome:
 *                           type: number
 *                           example: 5000000
 *                         totalExpense:
 *                           type: number
 *                           example: 4200000
 *                         netProfit:
 *                           type: number
 *                           example: 800000
 *                     categoryBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           period:
 *                             type: string
 *                             example: 2025-09-01
 *                           categoryId:
 *                             type: string
 *                             example: 650fa42e9b123
 *                           categoryName:
 *                             type: string
 *                             example: 식비
 *                           type:
 *                             type: string
 *                             enum: [income, expense]
 *                             example: expense
 *                           amount:
 *                             type: number
 *                             example: 500000
 *       '400':
 *         $ref: '#/components/error/BadRequestError'
 *       '401':
 *         $ref: '#/components/error/UnauthorizedError'
 *       '500':
 *         $ref: '#/components/error/ServerError'
 */
router.get("/", verifyAccessToken, reportController.getFinancialReport);

/**
 * @swagger
 * /api/reports/top-spending:
 *   get:
 *     summary: 상위 지출 내역 분석
 *     tags: [Reports]
 *     description: |
 *       지정된 기간 동안 가장 많이 지출한 내역 상위 20개(혹은 요청값)를 제공합니다.
 *       내역(description) 단위로 집계되며, 카테고리 정보가 포함됩니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AccessTokenHeader'
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: 조회 시작일
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: 조회 종료일
 *     responses:
 *       '200':
 *         description: 지출 상위 내역 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 지출 상위 20개 항목 분석 완료
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   example: 2025-09-01
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   example: 2025-09-30
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       description:
 *                         type: string
 *                         example: 스타벅스 커피
 *                       categoryId:
 *                         type: string
 *                         example: 650fa42e9b123
 *                       categoryName:
 *                         type: string
 *                         example: 식비
 *                       totalSpent:
 *                         type: number
 *                         example: 45000
 *                       count:
 *                         type: number
 *                         example: 3
 *       '400':
 *         $ref: '#/components/error/BadRequestError'
 *       '401':
 *         $ref: '#/components/error/UnauthorizedError'
 *       '500':
 *         $ref: '#/components/error/ServerError'
 */
router.get(
  "/top-spending",
  verifyAccessToken,
  reportController.getSpendingAnalysis
);

/**
 * @swagger
 * /api/reports/category-detail:
 *   get:
 *     summary: 카테고리 상세 지출 분석
 *     tags: [Reports]
 *     description: |
 *       특정 대분류 카테고리 내에서 소분류별 지출 총액을 분석합니다.
 *       지정된 기간 동안 해당 대분류에 속한 소분류의 지출액을 합산하여 제공합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AccessTokenHeader'
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         required: true
 *         description: 대분류 카테고리 ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: 조회 시작일
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: 조회 종료일
 *     responses:
 *       '200':
 *         description: 카테고리 상세 지출 분석 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 카테고리 상세 지출 분석 완료
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   example: 2025-09-01
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   example: 2025-09-30
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       subCategoryId:
 *                         type: string
 *                         example: 650fa42e9b456
 *                       subCategoryName:
 *                         type: string
 *                         example: 외식
 *                       totalSpent:
 *                         type: number
 *                         example: 250000
 *       '400':
 *         $ref: '#/components/error/BadRequestError'
 *       '401':
 *         $ref: '#/components/error/UnauthorizedError'
 *       '500':
 *         $ref: '#/components/error/ServerError'
 */

router.get(
  "/category-detail",
  verifyAccessToken,
  reportController.getCategoryDetailAnalysis
);

module.exports = router;
