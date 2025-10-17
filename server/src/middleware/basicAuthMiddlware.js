// api 문서 보호를 위한 Basic Auth 미들웨어
const basicAuth = require("express-basic-auth");
const rateLimit = require("express-rate-limit");
const { AUTH_USER, AUTH_PASSWORD } = require("../config/index"); // 환경 변수

// Basic Auth 설정
const basicAuthOptions = {
  users: { [AUTH_USER]: AUTH_PASSWORD },
  challenge: true,
  unauthorizedResponse: (req) => {
    return req.auth ? "Credentials rejected" : "No credentials provided";
  },
};

// 인증 실패 시에도 일정량의 요청을 허용하기 위한 rate limit 설정
const AUTH_LIMIT = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 10,
  message: {
    message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
  },
});

const auth = basicAuth(basicAuthOptions);

const conditionalAuth = (req, res, next) => {
  if (req.auth) {
    return next();
  }

  AUTH_LIMIT(req, res, next);
};

module.exports = [auth, conditionalAuth];
