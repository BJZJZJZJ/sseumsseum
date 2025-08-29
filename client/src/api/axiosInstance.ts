import axios from 'axios';

const baseURL = '/api/v1';

const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5초 이상 응답이 없으면 에러 처리
});

export default axiosInstance;