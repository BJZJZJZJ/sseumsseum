import axiosInstance from './axiosInstance';
import type { FetchFinancialTrendResponse, FetchTopSpendingResponse, FetchCategoryDetailResponse } from '../types/api';

/**
 * GET /api/v1/reports/
 * 지정된 기간의 재무 추이 보고서를 조회합니다.
 */
export const fetchFinancialTrendReport = async ({ startDate, endDate }: { startDate: string, endDate: string }): Promise<FetchFinancialTrendResponse> => {
  const response = await axiosInstance.get<FetchFinancialTrendResponse>('/reports/', {
    params: {
      type: 'monthly', // API 명세에 따라 월간 집계 유형 사용
      startDate,
      endDate,
    },
  });
  return response.data;
};

/**
 * GET /api/v1/reports/top-spending
 * 지정된 기간의 상위 지출 내역을 조회합니다.
 */
export const fetchTopSpendingReport = async ({ startDate, endDate }: { startDate: string, endDate: string }): Promise<FetchTopSpendingResponse> => {
  const response = await axiosInstance.get<FetchTopSpendingResponse>('/reports/top-spending', {
    params: {
      startDate,
      endDate,
    },
  });
  return response.data;
};

/**
 * GET /api/v1/reports/category-detail
 * 지정된 기간의 특정 카테고리에 대한 상세 지출을 조회합니다.
 */
export const fetchCategoryDetailReport = async (
  { categoryId, startDate, endDate }: { categoryId: string, startDate: string, endDate: string }
): Promise<FetchCategoryDetailResponse> => {
  const response = await axiosInstance.get<FetchCategoryDetailResponse>('/reports/category-detail', {
    params: { categoryId, startDate, endDate },
  });
  return response.data;
};