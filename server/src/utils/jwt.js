const jwt = require("jsonwebtoken");
const {
  JWT_REFRESH_TOKEN_SECRET,
  JWT_REFRESH_EXPIRY,
  JWT_ACCESS_TOKEN_SECRET,
  JWT_ACCESS_EXPIRY,
} = require("../config/index");

const createRefreshToken = (payload) => {
  const refreshToken = jwt.sign(payload, JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
  });

  return refreshToken;
};

const createAccessToken = (payload) => {
  const accessToken = jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY,
  });

  return accessToken;
};

module.exports = {
  createAccessToken,
  createRefreshToken,
};
