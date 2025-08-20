const path = require("path");
const dotenv = require("dotenv");

// 환경 변수 설정 불러오기
dotenv.config({
  path: path.resolve(__dirname, `../../.env.${process.env.NODE_ENV}`),
});

// 환경 변수 정의
const CORS_ALLOWED_ORIGIN = process.env.CORS_ALLOWED_ORIGIN;
const SERVER_URL = process.env.SERVER_URL;
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY;

const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY;

module.exports = {
  CORS_ALLOWED_ORIGIN,
  SERVER_URL,
  PORT,
  DATABASE_URL,
  JWT_ACCESS_TOKEN_SECRET,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_TOKEN_SECRET,
  JWT_REFRESH_EXPIRY,
};
