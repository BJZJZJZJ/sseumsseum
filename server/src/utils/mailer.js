const nodemailer = require("nodemailer");
const {
  SMTP_PORT,
  SMTP_HOST,
  SMTP_USER,
  SMTP_PASS,
  TOKEN_EXPIRES_MIN,
} = require("../config/index");

async function createTransporter() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  return transporter;
}

async function sendVerificationEmail({ to, link }) {
  const transporter = await createTransporter();

  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;">
      <h2>이메일 인증 안내</h2>
      <p>아래 버튼을 클릭하여 이메일을 인증해 주세요.</p>
      <p><a href="${link}" style="display:inline-block;padding:10px 16px;border-radius:8px;border:1px solid #ddd;text-decoration:none;">이메일 인증하기</a></p>
      <p style="color:#666;">유효시간: ${TOKEN_EXPIRES_MIN || 30}분</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "이메일 인증을 완료해 주세요",
    html,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  return info;
}

module.exports = { sendVerificationEmail };
