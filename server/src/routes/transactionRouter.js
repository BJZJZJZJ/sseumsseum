const router = require("express").Router();
const transactionController = require("../controllers/transactionController");

/**
 * @swagger
 * /api/v1/transactions/:
 *   get:
 *     summary: 거래내역 조회
 *     description: 이용자의 거래 내역을 조회합니다. 토큰이 필수입니다.
 *     parameters:
 *      - in: query
 *        name: q
 *        description: '검색어'
 *        required: false
 *        example: 커피
 *      - in: query
 *        name: startDate
 *        required: false
 *        example: 2023-01-01
 *        description: 조회 시작 날짜 (YYYY-MM-DD 형식)
 *      - in: query
 *        name: endDate
 *        required: false
 *        example: 2023-12-31
 *        description: 조회 종료 날짜 (YYYY-MM-DD 형식)
 *      - in: query
 *        name: type
 *        description: '거래 유형 (income: 수입, expense: 지출)'
 *        schema:
 *          type: string
 *          enum: [income, expense]
 *        required: false
 *        example: income
 *     tags: [transactions]
 *     security:
 *       bearerAuth: []
 *     responses:
 *       200:
 *         description: 이용자의 거래 내역이 성공적으로 조회되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/responses/TransactionResponse'
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       403:
 *         $ref: '#/components/error/ForbiddenError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.get("/", transactionController);

/**
 * @swagger
 * /api/v1/transactions/:
 *   post:
 *     summary: 거래내역 생성
 *     description: 이용자의 거래내역을 생성합니다. 토큰이 필수입니다.
 *     tags: [transactions]
 *     security:
 *       bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: 거래 내역이 성공적으로 생성되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/TransactionResponse'
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.post("/", transactionController);

/**
 * @swagger
 * /api/v1/transactions/{id}:
 *   put:
 *     summary: 거래내역 수정
 *     description: 이용자의 거래내역을 수정합니다. 토큰이 필수입니다.
 *     tags: [transactions]
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        example: 60c72b2f9b1e8d3f4c8b4567
 *        description: 거래내역의 ID
 *     security:
 *       bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: 거래내역이 성공적으로 수정되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/TransactionResponse'
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       403:
 *         $ref: '#/components/error/ForbiddenError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.put("/{id}", transactionController);

/**
 * @swagger
 * /api/v1/transactions/{id}:
 *   delete:
 *     summary: 거래내역 삭제
 *     description: 이용자의 거래내역을 삭제합니다. 토큰이 필수입니다.
 *     tags: [transactions]
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        example: 60c72b2f9b1e8d3f4c8b4567
 *        description: 거래내역 ID
 *     security:
 *       bearerAuth: []
 *     responses:
 *       200:
 *         description: 거래내역이 성공적으로 삭제되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 거래내역이 성공적으로 삭제되었습니다.
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       403:
 *         $ref: '#/components/error/ForbiddenError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.delete("/{id}", transactionController);

/**
 * @swagger
 * /api/v1/transactions/upload/:
 *   post:
 *     summary: 거래 내역 업로드
 *     description: CSV 파일을 통해 거래 내역을 업로드합니다. 토큰이 필수입니다.
 *     tags: [transactions]
 *     security:
 *       bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 CSV 파일
 *                 example: transactions.csv
 *     responses:
 *       200:
 *         description: 거래 내역이 성공적으로 업로드되었습니다.
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: 거래 내역이 성공적으로 업로드되었습니다.
 *                uploaded_data:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/responses/TransactionResponse'
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       403:
 *         $ref: '#/components/error/ForbiddenError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.post("/upload", transactionController.uploadTransaction);

module.exports = router;
