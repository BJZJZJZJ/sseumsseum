import axiosInstance from './axiosInstance';
import type { DashboardData } from '../types/api';

/**
 * GET /api/v1/dashboard/
 * 대시보드 데이터를 조회합니다.
 */
export const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await axiosInstance.get<{ data: DashboardData }>('/dashboard/');
  return response.data.data;
};