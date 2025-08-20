const router = require("express").Router();
const assetController = require("../controllers/assetController");

/**
 * @swagger
 * /api/v1/assets/:
 *   get:
 *     summary: 자산 조회
 *     description: 이용자의 자산 정보를 조회합니다. 토큰이 필수입니다.
 *     tags: [assets]
 *     parameters:
 *      - in: query
 *        name: q
 *        description: '검색어 (예: 현금, 카드 등)'
 *        required: false
 *        example: 현금
 *     security:
 *       bearerAuth: []
 *     responses:
 *       200:
 *         description: 이용자가 가진 모든 자산 정보가 성공적으로 반환되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/responses/AssetResponse'
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       403:
 *         $ref: '#/components/error/ForbiddenError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.get("/", assetController);

/**
 * @swagger
 * /api/v1/assets/:
 *   post:
 *     summary: 자산 생성
 *     description: 이용자의 자산을 생성합니다. 토큰이 필수입니다.
 *     tags: [assets]
 *     security:
 *       bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Asset'
 *     responses:
 *       200:
 *         description: 자산이 성공적으로 생성되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/AssetResponse'
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.post("/", assetController);

/**
 * @swagger
 * /api/v1/assets/{id}:
 *   put:
 *     summary: 자산 수정
 *     description: 이용자의 자산을 수정합니다. 토큰이 필수입니다.
 *     tags: [assets]
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        example: 60c72b2f9b1e8d3f4c8b4567
 *        description: 자산의 ID
 *     security:
 *       bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Asset'
 *     responses:
 *       200:
 *         description: 자산이 성공적으로 수정되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/AssetResponse'
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       403:
 *         $ref: '#/components/error/ForbiddenError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.put("/{id}", assetController);

/**
 * @swagger
 * /api/v1/assets/{id}:
 *   delete:
 *     summary: 자산 삭제
 *     description: 이용자의 자산을 삭제합니다. 토큰이 필수입니다.
 *     tags: [assets]
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        example: 60c72b2f9b1e8d3f4c8b4567
 *        description: 자산의 ID
 *     security:
 *       bearerAuth: []
 *     responses:
 *       200:
 *         description: 자산이 성공적으로 삭제되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 자산이 성공적으로 삭제되었습니다.
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       403:
 *         $ref: '#/components/error/ForbiddenError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.delete("/{id}", assetController);

module.exports = router;
