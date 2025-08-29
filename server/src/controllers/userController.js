const { matchedData } = require("express-validator");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const { hashPassword, comparePassword } = require("../utils/password");
const { JWT_PASSWORD_TOKEN_SECRET } = require("../config/index");
const { createAccessToken, createRefreshToken } = require("../utils/jwt");
const { act } = require("react");

// 유저의 개인정보 조회
const getUserData = async (req, res) => {
  try {
    const userId = req.user.id; // authMiddleware에서 설정한 user 정보 사용

    const user = await User.findById(userId).select(
      "email nickname birth gender"
    ); // 비밀번호 제외하고 조회

    if (!user) {
      return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("유저 정보 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 비밀번호를 제외한 유저 개인정보 수정
const updateUserData = async (req, res) => {
  try {
    const userId = req.user.id; // authMiddleware에서 설정한 user 정보 사용
    const { nickname, birth, gender } = matchedData(req);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        nickname: nickname,
        birth: birth,
        gender: gender,
      },
      { new: true }
    ).select("email nickname birth gender"); // 비밀번호 제외하고 조회

    if (!user) {
      return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("유저 정보 수정 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 비밀번호 확인
const verifyPassword = async (req, res) => {
  const { currentPassword } = req.body;
  const userId = req.user.id;

  const user = await User.findById(userId); // 비밀번호 확인을 위해 해시된 비밀번호 포함 조회

  if (!user) {
    return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }

  // 비밀번호 검증
  const isMatch = await comparePassword(currentPassword, user.password_hash);

  if (!isMatch) {
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
  }

  // 비밀번호 확인 토큰 생성 (짧은 유효기간)
  const passwordToken = jwt.sign(
    { id: user._id, purpose: "passwordVerification" },
    JWT_PASSWORD_TOKEN_SECRET,
    { expiresIn: "10m" } // 10분 동안 유효
  );

  // 토큰을 응답 헤더에 포함
  res.setHeader("X-Password-Token", passwordToken);

  return res.status(200).json({ message: "비밀번호 확인 성공" });
};

// 비밀번호 수정 (현재 비밀번호 확인 후 수정)
const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id; // verifyPasswordToken 미들웨어에서 설정한 user 정보 사용

    // 새로운 비밀번호 해시화
    const { newPassword } = matchedData(req);
    const hashedPassword = await hashPassword(newPassword);

    const user = await User.findByIdAndUpdate(
      userId,
      { password_hash: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }

    // 비밀번호 수정완료 후 비밀번호 토큰 파기 -> 클라이언트 몫
    // 로그인 상태 유지? -> refresh token 모두 삭제 후 재발급
    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);

    await RefreshToken.deleteMany({ userId: userId });
    await RefreshToken.create({ userId: userId, token: newRefreshToken });
    res.clearCookie("refreshToken");

    // 새로운 리프레시 토큰 쿠키 설정
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    res
      .status(200)
      .json({ message: "비밀번호 수정 성공", accessToken: newAccessToken });
  } catch (error) {
    console.error("비밀번호 수정 오류:", error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

module.exports = {
  getUserData,
  updateUserData,

  verifyPassword,
  updatePassword,
};
