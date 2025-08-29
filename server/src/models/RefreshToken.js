const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },

  token: {
    type: String,
    required: true,
  },

  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
  },

  // 로그아웃 시, 비밀번호 변경 시, 기간 만료 시 false
  // 추후 크론을 통해 false인 토큰들 제거
  isActive: {
    type: Boolean,
    default: true,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const BudgetModel = mongoose.model(
  "Refresh_tokens",
  refreshTokenSchema,
  "Refresh_tokens"
);

module.exports = BudgetModel;
