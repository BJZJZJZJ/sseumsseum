const router = require("express").Router();
const dashboardController = require("../controllers/dashboardController");
const { verifyAccessToken } = require("../middleware/authMiddleware");
/**
 * @swagger
 * /api/v1/dashboard/:
 *   get:
 *     tags: [Dashboard]
 *     description: 대시보드 관련 API
 *     summary: 대시보드 조회
 *     parameters:
 *      - $ref: '#/components/parameters/AccessTokenHeader'
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       '200':
 *         description: 성공적으로 대시보드 데이터를 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 대시보드 데이터 조회 완료
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       description: 당월 및 전월 지출 요약 비교
 *                       properties:
 *                         currentMonthSpent:
 *                           type: number
 *                           example: 1250000
 *                           description: 이번 달 총 지출액 (양수)
 *                         previousMonthSpent:
 *                           type: number
 *                           example: 1500000
 *                           description: 저번 달 총 지출액 (양수)
 *                         comparison:
 *                           type: number
 *                           example: -16.67
 *                           description: "전월 대비 지출 변화율 (%) (음수: 절약, 양수: 증가)"
 *                     dailySpent:
 *                       type: object
 *                       description: 일자별 지출 추이 데이터 (그래프용)
 *                       properties:
 *                         currentMonth:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                                 format: date
 *                                 example: 2025-09-20
 *                               amount:
 *                                 type: number
 *                                 example: 50000
 *                         previousMonth:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                                 format: date
 *                                 example: 2025-08-20
 *                               amount:
 *                                 type: number
 *                                 example: 75000
 *                     categorySpent:
 *                       type: array
 *                       description: "당월 카테고리별 지출 현황 (Top 10 및 '기타' 통합)"
 *                       items:
 *                         type: object
 *                         properties:
 *                           categoryName:
 *                             type: string
 *                             example: 식비
 *                           totalSpent:
 *                             type: number
 *                             example: 500000
 *                     advice:
 *                       type: string
 *                       example: "이번 달 지출의 45%가 '식비'에 집중되어 있습니다. 이 지출이 꼭 필요했는지 확인하는 것을 권장합니다."
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.get("/", verifyAccessToken, dashboardController.getDashboardSummary); // 대시보드 조회

module.exports = router;
