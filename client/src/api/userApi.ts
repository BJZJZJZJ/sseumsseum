import axiosInstance from './axiosInstance';
import type { 
  UserProfileResponse, 
  PasswordVerifyRequest, 
  PasswordVerifyResponse,
  ProfileUpdateRequest,
  PasswordChangeRequest,
  PasswordChangeResponse
} from '../types/api';

/**
 * GET /users/me
 * 현재 로그인된 사용자의 개인정보를 조회합니다.
 */
export const fetchUserProfile = async (): Promise<UserProfileResponse> => {
  const response = await axiosInstance.get<UserProfileResponse>('/users/me');
  return response.data;
};

/**
 * POST /users/me/password
 * 현재 로그인된 사용자의 비밀번호를 확인합니다.
 */
export const verifyCurrentUserPassword = async (data: PasswordVerifyRequest): Promise<PasswordVerifyResponse> => {
  const response = await axiosInstance.post<PasswordVerifyResponse>('/users/me/password', data);
  return response.data;
};

/**
 * PUT /users/me
 * 현재 로그인된 사용자의 프로필 정보를 수정합니다.
 */
export const updateUserProfile = async (data: ProfileUpdateRequest): Promise<UserProfileResponse> => {
  const response = await axiosInstance.put<UserProfileResponse>('/users/me', data);
  return response.data;
};

/**
 * PUT /users/me/password
 * 현재 로그인된 사용자의 비밀번호를 변경합니다.
 * @param data - 새 비밀번호 정보
 * @param passwordToken - 비밀번호 확인 시 받은 임시 토큰
 */
export const changeUserPassword = async (data: PasswordChangeRequest, passwordToken: string): Promise<PasswordChangeResponse> => {
  const response = await axiosInstance.put<PasswordChangeResponse>(
    '/users/me/password', 
    data,
    {
      headers: {
        'X-Password-Token': passwordToken,
      },
    }
  );
  return response.data;
};

/**
 * DELETE /users/me/
 * 회원 탈퇴를 진행합니다.
 * @param passwordToken - 비밀번호 확인 시 받은 임시 토큰
 */
export const deleteUserAccount = async (passwordToken: string): Promise<void> => {
  await axiosInstance.delete('/users/me/', {
    headers: {
      'X-Password-Token': passwordToken,
    },
  });
};