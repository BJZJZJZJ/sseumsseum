const jwt = require("jsonwebtoken");
const {
  JWT_ACCESS_TOKEN_SECRET,
  JWT_PASSWORD_TOKEN_SECRET,
} = require("../config/index");

// 액세스 토큰 검증 미들웨어
const verifyAccessToken = (req, res, next) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers["authorization"];

    // 헤더가 없거나 Bearer 토큰 형식이 아니면 401
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "인증 헤더가 유효하지 않습니다." });
    }

    // token 추출
    const token = authHeader.split(" ")[1];

    const payload = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET);

    // payload를 요청 객체에 담아서 다음 미들웨어로 전달
    req.user = payload;
    next();
  } catch (error) {
    console.error("토큰 검증 오류:", error);
    if (error instanceof jwt.TokenExpiredError) {
      // 1. 토큰 만료 에러
      return res.status(401).json({
        message: "토큰이 만료되었습니다.",
        code: "TOKEN_EXPIRED",
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      // 2. 잘못된 토큰 에러 (서명 오류, 변조 등)
      return res.status(401).json({
        message: "유효하지 않은 토큰입니다.",
        code: "INVALID_TOKEN",
      });
    } else {
      // 3. 기타 에러
      return res.status(401).json({
        message: "인증에 실패했습니다.",
        code: "AUTH_FAILED",
      });
    }
  }
};

// 비밀번호 확인 토큰 검증 미들웨어
const verifyPasswordToken = (req, res, next) => {
  try {
    const passwordToken = req.headers["x-password-token"];

    if (!passwordToken) {
      return res
        .status(401)
        .json({ message: "비밀번호 토큰이 헤더에 존재하지 않습니다." });
    }

    const payload = jwt.verify(passwordToken, JWT_PASSWORD_TOKEN_SECRET);

    // 토큰의 목적이 비밀번호 검증인지 확인
    if (payload.purpose !== "passwordVerification") {
      return res
        .status(401)
        .json({ message: "유효하지 않은 비밀번호 토큰입니다." });
    }

    // payload를 요청 객체에 담아서 다음 미들웨어로 전달
    req.user = payload;
    next();
  } catch (error) {
    console.error("비밀번호 토큰 검증 오류:", error);
    return res
      .status(401)
      .json({ message: "유효하지 않은 비밀번호 토큰입니다." });
  }
};

module.exports = { verifyAccessToken, verifyPasswordToken };
