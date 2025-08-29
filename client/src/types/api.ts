// /auth/register (회원가입)
export interface RegisterData {
  email: string;
  password: string;
  nickname: string;
  birthdate: string; // YYYY-MM-DD
  gender: 'male' | 'female';
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

