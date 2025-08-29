const mongoose = require("mongoose");

const verificationTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    // 저장은 해시로(토큰 유출 대비)
    tokenHash: { type: String, required: true, index: true },
    // 6자리 코드(선택)
    code: { type: String }, // '123456'
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
    purpose: { type: String, enum: ["email-verify"], default: "email-verify" },
  },
  { timestamps: true }
);

// 만료/사용된 문서는 TTL 인덱스로 주기적으로 정리할 수도 있음(옵션)
verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

verificationTokenModel = mongoose.model(
  "VerificationToken",
  verificationTokenSchema,
  "VerificationToken"
);

module.exports = verificationTokenModel;
