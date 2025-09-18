const router = require("express").Router();
const dashboardController = require("../controllers/dashboardController");
const { verifyAccessToken } = require("../middleware/authMiddleware");
/**
 * @swagger
 * /api/v1/dashboard/:
 *   get:
 *     tags: [(O) Dashboard]
 *     description: 대시보드 관련 API
 *     summary: 대시보드 조회
 *     parameters:
 *      - $ref: '#/components/parameters/AccessTokenHeader'
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: 대시보드에 필요한 데이터값을 반환합니다. (이번달, 저번달 거래내역 / 카테고리별 지출 등)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lastMonth:
 *                   type: object
 *                   properties:
 *                     expense:
 *                       type: object
 *                       properties:
 *                         category:
 *                           type: object
 *                           properties:
 *                             기타:
 *                               type: number
 *                               example: 140000
 *                             문화:
 *                               type: number
 *                               example: 50000
 *                             식비:
 *                               type: number
 *                               example: 140000
 *                         daily:
 *                           type: object
 *                           properties:
 *                             1:
 *                               type: number
 *                               example: 2500
 *                             15:
 *                               type: number
 *                               example: 33000
 *                             30:
 *                               type: number
 *                               example: 2700000
 *                         total:
 *                           type: number
 *                           example: 250000
 *                     income:
 *                       type: object
 *                       properties:
 *                         category:
 *                           type: object
 *                           properties:
 *                             기타:
 *                               type: number
 *                               example: 140000
 *                             월급:
 *                               type: number
 *                               example: 50000000
 *                         daily:
 *                           type: object
 *                           properties:
 *                             1:
 *                               type: number
 *                               example: 2500
 *                             15:
 *                               type: number
 *                               example: 33000
 *                             30:
 *                               type: number
 *                               example: 2700000
 *                         total:
 *                           type: number
 *                           example: 250000
 *                 thisMonth:
 *                   type: object
 *                   properties:
 *                     expense:
 *                       type: object
 *                       properties:
 *                         category:
 *                           type: object
 *                           properties:
 *                             기타:
 *                               type: number
 *                               example: 140000
 *                             문화:
 *                               type: number
 *                               example: 50000
 *                             식비:
 *                               type: number
 *                               example: 140000
 *                         daily:
 *                           type: object
 *                           properties:
 *                             1:
 *                               type: number
 *                               example: 2500
 *                             15:
 *                               type: number
 *                               example: 33000
 *                             30:
 *                               type: number
 *                               example: 2700000
 *                         total:
 *                           type: number
 *                           example: 250000
 *                     income:
 *                       type: object
 *                       properties:
 *                         category:
 *                           type: object
 *                           properties:
 *                             기타:
 *                               type: number
 *                               example: 140000
 *                             월급:
 *                               type: number
 *                               example: 50000
 *                         daily:
 *                           type: object
 *                           properties:
 *                             1:
 *                               type: number
 *                               example: 2500
 *                             15:
 *                               type: number
 *                               example: 33000
 *                             30:
 *                               type: number
 *                               example: 2700000
 *                         total:
 *                           type: number
 *                           example: 250000
 *                 advice:
 *                   type: string
 *                   example: "지난 달 대비 지출이 15151% 늘었네요. 더 분발하시면 좋은 결과 있을 거에요!"
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.get("/", verifyAccessToken, dashboardController.getDashboard); // 대시보드 조회

module.exports = router;
