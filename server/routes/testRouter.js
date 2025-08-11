const router = require("express").Router();
const testController = require("../controllers/testController");

/**
 * @swagger
 * /api/test:
 *   get:
 *     summary: 테스트 API
 *     description: API 문서 작성되는지 테스트
 *     tags: [test]
 *     responses:
 *       200:
 *         description: API 문서 작성되는지 테스트
 */
router.get("/", testController.test);

module.exports = router;
