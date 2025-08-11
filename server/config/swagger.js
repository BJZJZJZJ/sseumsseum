const { describe } = require("pm2");
const swaggerJsdoc = require("swagger-jsdoc");
const port = 44445;

// Swagger JSDoc 옵션 설정
const swaggerOptions = {
  definition: {
    openapi: "3.0.0", // OpenAPI 버전
    info: {
      title: "씀씀 API", // API 문서 제목
      version: "1.0.0", // API 버전
      description: "스마트 가계부 씀씀 API 문서", // API 문서 설명
    },
    servers: [
      {
        url: `http://158.180.84.232:${port}`, // API 서버 URL
        describition: "API 개발 서버",
      },
    ],
  },
  apis: ["./routes/*.js"], // Swagger JSDoc 주석이 있는 파일 경로
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = {
  swaggerSpec,
};
