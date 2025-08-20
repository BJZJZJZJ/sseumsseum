const User = require("../models/User");

const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../utils/password");
const { matchedData } = require("express-validator");
const {
  JWT_REFRESH_TOKEN_SECRET,
  JWT_REFRESH_EXPIRY,
  JWT_ACCESS_TOKEN_SECRET,
  JWT_ACCESS_EXPIRY,
} = require("../config/index");

/** 회원가입 */
const createUser = async (req, res) => {
  // validator를 통해 req.body 값을 가져옴
  const user = matchedData(req);

  try {
    // 이메일 중복 체크
    const existingUser = await User.findOne({ email: user.email });

    if (existingUser)
      return res.status(409).json({ message: "이미 존재하는 사용자입니다." });

    // 비밀번호 해싱
    user.password_hash = await hashPassword(user.password);
    delete user.password; // 평문 비밀번호 제거

    // 사용자 생성
    const newUser = new User(user);
    await newUser.save();

    // 응답
    res.status(201).json({ message: "회원가입이 성공했습니다." });
  } catch (error) {
    console.error("회원가입 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/** 로그인 */
const login = async (req, res) => {
  const bodyData = matchedData(req);
  let isValid = false;

  try {
    const user = await User.findOne({ email: bodyData.email }).select(
      "password_hash"
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

    // 토큰 생성
    const refreshToken = jwt.sign(user._id, JWT_REFRESH_TOKEN_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRY,
    });
    const accessToken = jwt.sign(user._id, JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRY,
    });

    // 토큰 전송
    res.status(201).json({
      message: "로그인에 성공했습니다.",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch {
    console.error("로그인 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/*
  1. Token에 넣는 값 조정 (이메일, role, 닉네임 등)
  2. refresh 토큰 DB에 저장 + 로그아웃 시 파기
  3. Token 만든 작업 함수화

  refreshToken은 Cookie에, accessToken은 json에 첨부
*/

const updateToken = async (req, res) => {};
const logout = async (req, res) => {};

module.exports = {
  createUser,
  login,
  updateToken,
  logout,
};
