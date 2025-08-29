// 회원가입 페이지 폼 데이터 타입
export interface SignupFormData {
  email: string,
  password: string,
  confirmPassword: string,
  nickname: string,
  birthdate: string,
  gender: '남' | '여'
}

// POST /auth/register 요청 본문 타입
export interface RegisterRequestData {
  email: string;
  password: string;
  nickname: string;
  birth: string; // YYYY-MM-DD
  gender: '남' | '여';
}

// /auth/login (로그인)
export interface LoginData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

// /auth/refresh (토큰 갱신)
export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// /auth/resend (인증 메일 재전송)
export interface ResendRequest {
  email: string;
}

