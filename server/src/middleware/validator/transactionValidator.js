const {
  body,
  validationResult,
  checkExact,
  check,
  query,
  header,
  param,
} = require("express-validator");

const validateGetTransactions = [
  header("Authorization").notEmpty(),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 10, max: 20 }),
  query("startDate").optional().isISO8601().toDate(),
  query("endDate").optional().isISO8601().toDate(),
  query("type").optional().isIn(["income", "expense"]),
  query("q").optional(),
];

const validateCreateTransaction = [
  header("Authorization").notEmpty(),
  body("amount").notEmpty(),
  body("type").notEmpty().isIn(["income", "expense"]),
  body("datetime").notEmpty().isISO8601().toDate(),
  body("method").optional().isIn(["cash", "card", "transfer", "other"]),
  body("categoryId").notEmpty().isMongoId(),
  body("description").optional(),
];

const validateCsvFile = [
  header("Authorization").notEmpty(),
  body("csvFile").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("csv 파일이 필요합니다.");
    }

    if (req.file.mimetype !== "text/csv") {
      throw new Error("올바른 CSV 파일 형식이 아닙니다.");
    }
    return true;
  }),
];

const validateUpdateTransaction = [
  header("Authorization").notEmpty(),
  param("id").notEmpty().isMongoId(),
  body("amount").optional(),
  body("type").optional().isIn(["income", "expense"]),
  body("datetime").optional().isISO8601().toDate(),
  body("method").optional().isIn(["cash", "card", "transfer", "other"]),
  body("categoryId").optional().isMongoId(),
  body("description").optional(),
];

const validateDeleteTransaction = [
  header("Authorization").notEmpty(),
  param("id").notEmpty().isMongoId(),
];

const validationHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "입력한 값이 올바르지 않습니다." });
  }
  next();
};

module.exports = {
  validateGetTransactions,
  validateCreateTransaction,
  validateCsvFile,
  validateUpdateTransaction,
  validateDeleteTransaction,
  validationHandler,
};
