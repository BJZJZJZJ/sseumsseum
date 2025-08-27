const rateLimit = require("express-rate-limit");

const RESEND_LIMIT = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 3,
  message: {
    message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
  },
});

module.exports = { RESEND_LIMIT };
