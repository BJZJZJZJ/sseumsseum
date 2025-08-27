const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const VerificationToken = require("../models/VerificationToken");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { matchedData } = require("express-validator");
const { hashPassword, comparePassword } = require("../utils/password");
const { createAccessToken, createRefreshToken } = require("../utils/jwt");
const {
  JWT_REFRESH_TOKEN_SECRET,
  TOKEN_EXPIRES_MIN,
  SERVER_URL,
} = require("../config/index");

const { sendVerificationEmail } = require("../utils/mailer");

const COOKIE_MAX_AGE = 3600 * 24 * 15; // 쿠키 유지 시간 (15일)

// 이메일 인증용 6자리 랜덤코드
const genSixCode = () => Math.floor(100000 + Math.random() * 900000).toString(); // 6자리
// 이메일 인증용 임시 토큰 해시
const hashToken = (raw) =>
  crypto.createHash("sha256").update(raw).digest("hex");

// 인증용 임시토큰 생성 + 인증 이메일 생성 및 전송 함수
async function issueVerification(user) {
  // 랜덤 32바이트 → 링크용 토큰
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const code = genSixCode();
  const expiresMin = Number(TOKEN_EXPIRES_MIN || 30);
  const expiresAt = new Date(Date.now() + expiresMin * 60 * 1000);

  // 기존 미사용 토큰 무효화
  await VerificationToken.updateMany(
    { userId: user._id, purpose: "email-verify", usedAt: { $exists: false } },
    { $set: { usedAt: new Date() } }
  );

  // 새로운 인증 토큰 생성 및 저장
  await VerificationToken.create({
    userId: user._id,
    tokenHash,
    code,
    expiresAt,
    purpose: "email-verify",
  });

  const verifyLink = `${SERVER_URL}/api/v1/auth/verify?token=${rawToken}&email=${encodeURIComponent(
    user.email
  )}`;

  await sendVerificationEmail({
    to: user.email,
    link: verifyLink,
    code,
  });
}

/** 회원가입 */
// gmail SMTP를 활용한 이메일 인증으로 코드 변경 예정
const createUser = async (req, res) => {
  // validator를 통해 req.body 값을 가져옴
  const user = matchedData(req);

  try {
    // 이메일 중복 체크
    const existingUser = await User.findOne({ email: user.email });

    if (existingUser)
      return res.status(409).json({ message: "이미 존재하는 이메일입니다." });

    // 비밀번호 해싱
    user.password_hash = await hashPassword(user.password);
    delete user.password; // 평문 비밀번호 제거

    // 사용자 생성
    const newUser = new User(user);
    await newUser.save();

    await issueVerification(newUser);

    // 응답
    res.status(201).json({
      message: "회원가입이 성공했습니다. 이메일을 확인해 인증을 진행해주세요.",
    });
  } catch (error) {
    console.error("회원가입 오류:", error);
    res
      .status(500)
      .json({ message: "서버 오류가 발생했습니다. 나중에 다시 시도해주세요." });
  }
};

/** 인증메일 재전송 */
const resendMail = async (req, res) => {
  const { email } = matchedData(req);

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "인증 메일이 재전송되었습니다." });
    }

    if (user.verified) {
      return res.status(200).json({ message: "이미 인증된 이메일입니다." });
    }

    await issueVerification(user);

    return res.status(200).json({ message: "인증 메일이 재전송되었습니다." });
  } catch (error) {
    console.error("인증 메일 재전송 오류:", error);
    res
      .status(500)
      .json({ message: "서버 오류가 발생했습니다. 나중에 다시 시도해주세요." });
  }
};

/** 링크 클릭 인증 */
const verifyEmail = async (req, res) => {
  const { token, email } = req.query;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const tokenHash = hashToken(token);
    const verificationRecord = await VerificationToken.findOne({
      userId: user._id,
      tokenHash: tokenHash,
      purpose: "email-verify",
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });

    if (!verificationRecord) {
      return res
        .status(400)
        .json({ message: "유효하지 않은 또는 만료된 토큰입니다." });
    }

    // 토큰 사용 처리
    verificationRecord.usedAt = new Date();
    await verificationRecord.save();

    // 사용자 인증 상태 업데이트
    user.verified = true;
    await user.save();

    // 디렉토리 redirect
    return res.redirect("/"); // 프론트 라우트로 교체 가능
    // return res.status(201).json({ message: "이메일 인증이 완료되었습니다." });
  } catch (e) {
    console.error("이메일 인증 오류:", e);
    return res
      .status(500)
      .json({ message: "서버 오류가 발생했습니다. 나중에 다시 시도해주세요." });
  }
};

/** 로그인 */
const login = async (req, res) => {
  const bodyData = matchedData(req);
  let isValid = false; // 검증 통과 변수

  try {
    // 검증을 위한 해싱 비밀번호 추출
    const user = await User.findOne({ email: bodyData.email }).select(
      "password_hash role verified"
    );

    // 유저가 존재할 경우, 비밀번호 검증
    if (user) {
      isValid = await comparePassword(bodyData.password, user.password_hash);
    }

    if (!isValid) {
      return res
        .status(401)
        .json({ message: "이메일 또는 비밀번호가 일치하지 않습니다." });
    }

    if (!user.verified) {
      return res.status(403).json({ message: "이메일 인증이 필요합니다." });
    }

    // 토큰 생성
    const refreshToken = createRefreshToken({ id: user._id });
    const accessToken = createAccessToken({ id: user._id, role: user.role });

    // 토큰 생성 중 오류 발생한 경우 에러 호출 (할 일이 있을까?)
    if (!refreshToken || !accessToken) throw new Error("Token Error");

    // 유저가 기존에 가지고 있던 리프레시 토큰들 무효화
    // 로그인 api를 무한정 호출하면 token이 여러개 만들어지기에 작성
    // 여러 기기에서 동시 로그인 하는 경우는?
    await RefreshToken.updateMany(
      { userId: user._id, isActive: true }, // 조건
      { $set: { isActive: false } } // 업데이트 내용
    );

    // 새로운 리프레시 토큰 DB 삽입
    const refreshTokenDocument = new RefreshToken({
      userId: user._id,
      token: refreshToken,
    });
    await refreshTokenDocument.save();

    // refreshToken 쿠키 저장
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: COOKIE_MAX_AGE,
    });
    // 토큰 전송
    res.status(201).json({
      message: "로그인에 성공했습니다.",
      accessToken: accessToken,
    });
  } catch (error) {
    console.error("로그인 오류", error);
    res
      .status(500)
      .json({ message: "서버 오류가 발생했습니다. 나중에 다시 시도해주세요." });
  }
};

/** RefreshToken , AccessToken 갱신 */
const updateToken = async (req, res) => {
  // 쿠키에 있는 리프레시 참조
  const refreshToken = req.cookies.refreshToken;

  try {
    // userId 값만 추출
    const { id } = jwt.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET);

    // 토큰이 DB에 저장된 토큰의 유효성 검사
    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      isActive: true,
    });
    if (!storedToken)
      return res.status(401).json({ message: "유효하지 않은 토큰입니다." });

    // 기존 리프레시 토큰 DB에서 비활성화
    await RefreshToken.findOneAndUpdate(
      { token: refreshToken },
      { $set: { isActive: false } }
    );

    // payload 작성을 위해 role 값 추출
    const userData = await User.findById(id).select("role");

    // 새로운 토큰 생성
    const newAccessToken = createAccessToken({
      id: id,
      role: userData.role,
    });
    const newRefreshToken = createRefreshToken({ id: id });

    // 새로운 리프레시 토큰 DB 저장
    const newRefreshTokenDocument = new RefreshToken({
      userId: id,
      token: newRefreshToken,
    });
    await newRefreshTokenDocument.save();

    // 토큰 전송
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: COOKIE_MAX_AGE,
    });

    res.status(201).json({
      message: "액세스 토큰이 갱신되었습니다.",
      newAccesesToken: newAccessToken,
    });
  } catch (error) {
    console.error("토큰 검증 오류:", error);
    res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
};

/** 로그아웃 */
const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    // DB에서 리프래시 토큰 검색 후 isActive false로 변경
    const userRefreshToken = await RefreshToken.findOneAndUpdate(
      { token: refreshToken },
      { isActive: false }
    );

    if (!userRefreshToken) {
      return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }

    // 쿠키에서 토큰 삭제
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "로그아웃 성공" });
  } catch (error) {
    console.error("토큰 검증 오류:", error);
    res.status(500).json({
      message: "서버 오류가 발생했습니다. 나중에 다시 시도해주세요.",
    });
  }
};

module.exports = {
  createUser,
  resendMail,
  verifyEmail,
  login,
  updateToken,
  logout,
};
