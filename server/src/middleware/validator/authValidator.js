const { body, validationResult, checkExact } = require("express-validator");

const validateUserCreate = [
  body("email").notEmpty().isEmail(),
  body("password").notEmpty().isLength({ min: 4, max: 20 }),
  body("nickname").notEmpty().isLength({ min: 2, max: 8 }),
  body("birth").optional().isISO8601(),
  body("gender").optional().isIn(["남", "여"]),

  checkExact([], { message: "입력한 값이 올바르지 않습니다." }),
];

const validateLogin = [
  body("email").notEmpty().isEmail(),
  body("password").notEmpty(),

  checkExact([], { message: "입력한 값이 올바르지 않습니다." }),
];

const validationHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "입력한 값이 올바르지 않습니다." });
  }
  next();
};

module.exports = {
  validateUserCreate,
  validateLogin,

  validationHandler,
};
