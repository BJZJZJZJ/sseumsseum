import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import { refreshAuthToken } from './authApi';

let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const axiosInstance = axios.create({
  // ✅ [핵심 수정] 이제 개발/배포 환경 구분 없이 항상 상대 경로를 사용합니다.
  baseURL: '/api/v1',
  timeout: 5000,
  withCredentials: true,
});


axiosInstance.interceptors.request.use(
  (config) => {
    if (config.url === '/auth/refresh') {
      return config;
    }
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.config) return Promise.reject(error);

    const originalRequest = error.config as InternalAxiosRequestConfig;
    
    if (error.response?.status === 401 && originalRequest.url === '/auth/login') {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && originalRequest.url !== '/auth/refresh') {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (token && typeof token === 'string') {
            originalRequest.headers.set('Authorization', `Bearer ${token}`);
          }
          return axiosInstance(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const { newAccesesToken } = await refreshAuthToken();
        useAuthStore.getState().login(newAccesesToken);
        
        processQueue(null, newAccesesToken);
        originalRequest.headers.set('Authorization', `Bearer ${newAccesesToken}`);
        
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        
        useAuthStore.getState().logout();
        useUserStore.getState().clearProfile();
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

