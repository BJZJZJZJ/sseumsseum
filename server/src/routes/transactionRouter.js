const router = require("express").Router();
const transactionController = require("../controllers/transactionController");
const { verifyAccessToken } = require("../middleware/authMiddleware");
const upload = require("../utils/multer");

const validator = require("../middleware/validator/transactionValidator");

/**
 * @swagger
 * /api/v1/transactions/:
 *   get:
 *     summary: 거래내역 조회
 *     description: 이용자의 거래 내역을 조회합니다. 토큰이 필수입니다. 날짜 필터가 없는 경우, 최신 순으로 조회됩니다.
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
 *        name: page
 *        required: true
 *        description: 페이지 번호 (1부터 시작)
 *        schema:
 *          type: integer
 *          example: 1
 *      - in: query
 *        name: limit
 *        required: true
 *        description: 페이지당 항목 수
 *        schema:
 *          type: integer
 *          example: 10
 *      - in: query
 *        name: q
 *        description: '검색어'
 *        required: false
 *        schema:
 *          type: string
 *          example: 커피
 *      - in: query
 *        name: startDate
 *        required: false
 *        description: 조회 시작 날짜 (YYYY-MM-DD 형식)
 *        schema:
 *          type: string
 *          example: 2025-08-08
 *      - in: query
 *        name: endDate
 *        required: false
 *        description: 조회 종료 날짜 (YYYY-MM-DD 형식)
 *        schema:
 *          type: string
 *          example: 2025-08-10
 *      - in: query
 *        name: type
 *        description: '거래 유형 (income: 수입, expense: 지출)'
 *        schema:
 *          type: string
 *          enum: [income, expense]
 *          example: income
 *        required: false
 *     tags: [transactions ]
 *     responses:
 *       200:
 *         description: 이용자의 거래 내역이 성공적으로 조회되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   name: data
 *                   items:
 *                     $ref: '#/components/responses/TransactionResponse'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: number
 *                       example: 300
 *                     totalPages:
 *                       type: number
 *                       example: 15
 *                     currentPage:
 *                       type: number
 *                       example: 5
 *                     perPage:
 *                       type: number
 *                       example: 20
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.get(
  "/",
  verifyAccessToken,
  validator.validateGetTransactions,
  validator.validationHandler,
  transactionController.getTransaction
);

/**
 * @swagger
 * /api/v1/transactions/:
 *   post:
 *     summary: 거래내역 생성
 *     description: 이용자의 거래내역을 생성합니다. 토큰이 필수입니다.
 *     tags: [transactions ]
 *     parameters:
 *       - $ref: '#/components/parameters/AccessTokenHeader'
 *     security:
 *      - bearerAuth: []
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
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 거래내역이 성공적으로 생성되었습니다.
 *                 data:
 *                   $ref: '#/components/responses/TransactionResponse'
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       403:
 *         $ref: '#/components/error/ForbiddenError'
 *       404:
 *         $ref: '#/components/error/NotFoundError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.post(
  "/",
  verifyAccessToken,
  validator.validateCreateTransaction,
  validator.validationHandler,
  transactionController.createTransaction
);

/**
 * @swagger
 * /api/v1/transactions/:
 *   put:
 *     summary: 거래내역 수정
 *     description: 이용자의 거래내역을 수정합니다. 토큰이 필수입니다.
 *     tags: [transactions ]
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *          example: 60c72b2f9b1e8d3f4c8b4567
 *          description: 거래내역의 ID
 *      - in: header
 *        name: Authorization
 *        required: true
 *        schema:
 *          type: string
 *          description: Bearer {access_token}
 *          example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e
 *     security:
 *      - bearerAuth: []
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
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 거래내역이 성공적으로 수정되었습니다.
 *                 data:
 *                   $ref: '#/components/responses/TransactionResponse'
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       403:
 *         $ref: '#/components/error/ForbiddenError'
 *       404:
 *         $ref: '#/components/error/NotFoundError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.put(
  "/:id",
  verifyAccessToken,
  validator.validateUpdateTransaction,
  validator.validationHandler,
  transactionController.updateTransaction
);

/**
 * @swagger
 * /api/v1/transactions/:
 *   delete:
 *     summary: 거래내역 삭제
 *     description: 이용자의 거래내역을 삭제합니다. 토큰이 필수입니다.
 *     tags: [transactions ]
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *          example: 60c72b2f9b1e8d3f4c8b4567
 *          description: 거래내역의 ID
 *      - in: header
 *        name: Authorization
 *        required: true
 *        schema:
 *          type: string
 *          description: Bearer {access_token}
 *          example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e
 *     security:
 *      - bearerAuth: []
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
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       404:
 *         $ref: '#/components/error/NotFoundError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.delete(
  "/:id",
  verifyAccessToken,
  validator.validateDeleteTransaction,
  validator.validationHandler,
  transactionController.deleteTransaction
);

/**
 * @swagger
 * /api/v1/transactions/upload/:
 *   post:
 *     summary: 거래 내역 업로드
 *     description: CSV 파일을 통해 거래 내역을 업로드합니다. 토큰이 필수입니다.
 *     tags: [transactions ]
 *     parameters:
 *       - $ref: '#/components/parameters/AccessTokenHeader'
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               csvFile:
 *                 type: string
 *                 format: binary
 *                 description: 거래내역 CSV 파일
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
 *                  example: 총 179개의 데이터 중 178개의 거래내역이 업로드 됐습니다.
 *                error:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      row:
 *                        type: integer
 *                        description: 오류가 발생한 행 번호
 *                      errors:
 *                        type: string
 *                        description: 오류 메시지
 *                        example: ["입금과 출금이 동시에 존재합니다.", "거래일자는 유효한 날짜여야 합니다."]
 *
 *       400:
 *         $ref: '#/components/error/BadRequestError'
 *       401:
 *         $ref: '#/components/error/UnauthorizedError'
 *       500:
 *         $ref: '#/components/error/ServerError'
 */
router.post(
  "/upload",
  verifyAccessToken,
  upload.single("csvFile"),
  validator.validateCsvFile,
  validator.validationHandler,
  transactionController.uploadTransaction
);

module.exports = router;
