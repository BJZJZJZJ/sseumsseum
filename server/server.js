// express 모듈 불러오기
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// 환경변수 불러오기
const { CORS_ALLOWED_ORIGIN, SERVER_URL, PORT } = require("./src/config/index"); // 환경 변수 설정 불러오기

// MongoDB 연결 설정 불러오기
const connectDB = require("./src/config/db"); // MongoDB 연결 설정 불러오기
connectDB(); // MongoDB 연결

// Swagger 설정 불러오기
const { swaggerSpec, swaggerUiOptions } = require("./src/config/swagger"); // Swagger 설정 불러오기
const swaggerUi = require("swagger-ui-express");

// router 불러오기
const indexRouter = require("./src/routes/index"); // 라우터 설정 불러오기

// express 앱 생성
const app = express();

// 미들웨어 설정
app.use(express.json()); // JSON 요청 본문 파싱 미들웨어
app.use(cookieParser());

/*
app.use(
  cors({
    origin: [CORS_ALLOWED_ORIGIN, "http://localhost:3000", "http://localhost:5173"], // 클라이언트 주소
    credentials: true,
  })
);
*/

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions)
);

app.use("/api/v1/", indexRouter); // 유저 관련 라우터 설정

// 설정된 포트에서 서버 실행
app.listen(PORT, () => {
  console.log(`서버가 ${SERVER_URL} 에서 실행 중입니다.`);
});
