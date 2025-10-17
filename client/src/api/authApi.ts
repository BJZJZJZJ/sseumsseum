import axiosInstance from './axiosInstance';
import type { 
  SignupFormData,
  RegisterRequestData, 
  LoginRequestData, 
  LoginResponse, 
  RefreshResponse,
  ResendRequestData,
  ResendResponse,
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
export const loginUser = async (data: LoginRequestData): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>('/auth/login', data);
  return response.data;
};

/**
 * POST /auth/logout
 * 로그아웃을 요청합니다.
 */
export const logoutUser = async (): Promise<void> => {
  await axiosInstance.post('/auth/logout', null);
};

/**
 * POST /auth/refresh
 * 새로운 Access Token을 요청합니다.
 * Refresh Token은 HttpOnly 쿠키에 담겨 자동으로 전송됩니다.
 */
export const refreshAuthToken = async (): Promise<RefreshResponse> => {
  // 서버가 쿠키의 refreshToken을 사용하므로, body는 비워서 보냅니다.
  const response = await axiosInstance.post<RefreshResponse>('/auth/refresh', null);
  return response.data;
};

/**
 * POST /auth/resend
 * 인증 메일 재전송을 요청합니다.
 */
export const resendVerificationEmail = async (data: ResendRequestData): Promise<ResendResponse> => {
  const response = await axiosInstance.post<ResendResponse>('/auth/resend', data);
  return response.data;
};

/**
 * GET /auth/verify
 * 이메일 주소를 인증합니다.
 * @param token - 이메일 링크에 포함된 인증 토큰
 */
export const verifyUserEmail = async (token: string): Promise<void> => {
  await axiosInstance.get('/auth/verify', { params: { token } });
};

