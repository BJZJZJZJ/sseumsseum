import axiosInstance from './axiosInstance';
// src/types/api.ts에서 필요한 타입들을 { } 안에 명시하여 가져옵니다.
import type { 
  SignupFormData,
  RegisterRequestData, 
  LoginData, 
  AuthResponse, 
  RefreshResponse,
  ResendRequest
} from '../types/api';

/**
 * POST /auth/register
 * 회원가입을 요청합니다.
 */
export const registerUser = async (formData: SignupFormData): Promise<void> => {
  const apiData: RegisterRequestData = {
    email: formData.email,
    password: formData.password,
    nickname: formData.nickname,
    birth: formData.birthdate,
    gender: formData.gender
  }
  await axiosInstance.post('/auth/register', apiData);
};

/**
 * POST /auth/login
 * 로그인을 요청합니다.
 */
export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
  return response.data;
};

/**
 * POST /auth/logout
 * 로그아웃을 요청합니다.
 */
export const logoutUser = async (): Promise<void> => {
  await axiosInstance.post('/auth/logout');
};

/**
 * POST /auth/refresh
 * 새로운 Access/Refresh 토큰 쌍을 요청합니다.
 * @param refreshToken - 기존의 Refresh Token
 */
export const refreshAuthToken = async (refreshToken: string): Promise<RefreshResponse> => {
  const response = await axiosInstance.post<RefreshResponse>('/auth/refresh', { refreshToken });
  return response.data;
};

/**
 * POST /auth/resend
 * 이메일 인증 메일 재전송을 요청합니다.
 */
export const resendVerificationEmail = async (data: ResendRequest): Promise<void> => {
  await axiosInstance.post('/auth/resend', data);
};

/**
 * GET /auth/verify
 * 이메일 주소를 인증합니다.
 * @param token - 이메일 링크에 포함된 인증 토큰
 */
export const verifyUserEmail = async (token: string): Promise<void> => {
  // GET 요청에서는 params를 사용하여 쿼리 스트링을 추가합니다.
  await axiosInstance.get('/auth/verify', { params: { token } });
};

