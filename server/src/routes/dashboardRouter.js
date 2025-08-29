const router = require("express").Router();
const dashboardController = require("../controllers/dashboardController");

/**
 * @swagger
 * /api/v1/dashboard/:
 *   get:
 *     tags: [Dashboard]
 *     description: 대시보드 관련 API
 *     summary: 대시보드 조회
 *     security:
 *       bearerAuth: []
 *     responses:
 *       200:
 */
router.get("/", dashboardController.getDashboard); // 대시보드 조회

module.exports = router;
