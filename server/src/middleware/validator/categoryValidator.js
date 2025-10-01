const {
  body,
  header,
  query,
  param,
  check,
  validationResult,
} = require("express-validator");

const validateCategory = [
  header("Authorization").notEmpty(),
  body("name").notEmpty().isLength({ min: 1, max: 20 }),
  body("type").notEmpty().isIn(["income", "expense"]),
  body("parentCategory").optional().isMongoId(),
];

const validateGetCategories = [header("Authorization").notEmpty()];
const validateGetChildCategories = [
  header("Authorization").notEmpty(),
  check("parentId").notEmpty().isMongoId(),
];

const validateParamId = [
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
  post: [validateCategory, validationHandler],
  get: [validateGetCategories, validationHandler],
  getChild: [validateGetChildCategories, validationHandler],
  update: [validateCategory, validateParamId, validationHandler],
  delete: [validateParamId, validationHandler],
};
