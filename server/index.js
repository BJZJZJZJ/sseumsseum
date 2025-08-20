// 환경 변수 설정 불러오기
require("dotenv").config();

// express 모듈 불러오기
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Swagger 설정 불러오기
const { swaggerSpec } = require("./config/swagger"); // Swagger 설정 불러오기
const swaggerUi = require("swagger-ui-express");

// router 불러오기
const testRouter = require("./routes/testRouter");

// express 앱 생성
const app = express();

// 환경 변수 정의
const port = process.env.SERVER_PORT || 44445;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

console.log("환경 변수:", {
  port,
  CLIENT_URL,
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// 미들웨어 설정
app.use(express.json()); // JSON 요청 본문 파싱 미들웨어
app.use(cookieParser());

/*
app.use(
  cors({
    origin: [CLIENT_URL, "http://localhost:3000", "http://localhost:5173"], // 클라이언트 주소
    credentials: true,
  })
);
*/

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/test", testRouter); // 라우터 설정

// 설정된 포트에서 서버 실행
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
