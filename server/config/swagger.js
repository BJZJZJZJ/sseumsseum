const swaggerJsdoc = require("swagger-jsdoc");
const { SERVER_URL } = require("../config/index");

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
        url: `${SERVER_URL}`, // API 서버 URL
        describition: "API 서버",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  apis: [
    "./src/config/api-docs/*.yaml", // 새로 추가한 YAML 스키마 파일
    "./src/routes/*.js", // swagger 주석이 담긴 경로
  ],
};

const customCss = `
.swagger-ui .model-container {
  display: none;
}
.swagger-ui .models {
  display: none;
}
`;

const swaggerUiOptions = {
  customCss: customCss, // Swagger UI의 CSS 커스터마이징
  customSiteTitle: "씀씀 API 문서", // Swagger UI의 사이트 제목 설정};
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = {
  swaggerSpec,
  swaggerUiOptions,
};
