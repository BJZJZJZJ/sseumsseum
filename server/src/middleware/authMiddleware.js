const jwt = require("jsonwebtoken");
const { JWT_ACCESS_TOKEN_SECRET } = require("../config/index");

// 액세스 토큰 검증 미들웨어
const verifyToken = (req, res, next) => {
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
    // 토큰 만료 혹은 유효하지 않은 토큰
    return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
};

module.exports = { verifyToken };
