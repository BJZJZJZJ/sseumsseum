const router = require("express").Router();
const reportController = require("../controllers/reportController");

/**
 * @swagger
 * /api/v1/reports/:
 *   get:
 *     tags: [reports]
 *     description: 리포트 관련 API
 *     summary: 리포트 조회
 *     security:
 *       bearerAuth: []
 *     responses:
 *       200:
 */
router.get("/", reportController.getReport);

module.exports = router;
