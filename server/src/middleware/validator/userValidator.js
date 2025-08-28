const {
  validationResult,
  checkExact,
  check,
  header,
  body,
} = require("express-validator");

const validationGetUser = [header("Authorization").notEmpty()];

const validationUpdateUser = [
  header("Authorization").notEmpty(),
  body("nickname").optional().isString().isLength({ min: 2, max: 10 }),
  body("birth").optional().isISO8601().toDate(),
  body("gender").optional().isIn(["남", "여"]),
  checkExact([], { message: "입력한 값이 올바르지 않습니다." }),
];

const validationVerifyPassword = [
  header("Authorization").notEmpty(),
  check("currentPassword").notEmpty().isString().isLength({ min: 6, max: 20 }),
  checkExact([], { message: "입력한 값이 올바르지 않습니다." }),
];

const validationUpdatePassword = [
  header("X-Password-Token").notEmpty(),
  check("newPassword").notEmpty().isString().isLength({ min: 6, max: 20 }),
  check("confirmNewPassword")
    .notEmpty()
    .isString()
    .isLength({ min: 6, max: 20 })
    .custom((value, { req }) => value === req.body.newPassword),
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
  validationGetUser,
  validationUpdateUser,
  validationVerifyPassword,
  validationUpdatePassword,
  validationHandler,
};
