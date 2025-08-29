import axios from 'axios';
import useAuthStore from '../store/authStore';

const axiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 5000,
  withCredentials: true, // 쿠키 전송을 위해 필요한 설정
});

/**
 * Axios 요청 인터셉터
 * 모든 API 요청이 전송되기 전에, Zustand 스토어에서 accessToken을 가져와
 * Authorization 헤더에 Bearer 토큰으로 추가합니다.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // 컴포넌트 밖에서는 getState()로 스토어 상태에 접근합니다.
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

