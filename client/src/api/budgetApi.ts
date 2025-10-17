import axiosInstance from './axiosInstance';
import type { FetchBudgetResponse, BudgetData, CreateBudgetRequest, UpdateBudgetRequest, FetchBudgetReportResponse } from '../types/api';

/**
 * GET /api/v1/budgets
 * 특정 월의 예산 데이터를 조회합니다.
 * @param month - "YYYY-MM" 형식의 월
 */
export const fetchBudgets = async (month: string): Promise<BudgetData | null> => {
  try {
    // ✅ API 응답이 단일 객체이므로 FetchBudgetResponse로 타입을 지정합니다.
    const response = await axiosInstance.get<FetchBudgetResponse>('/budgets', {
      params: { month },
    });
    
    // ✅ 데이터가 있으면 response.data.data를 반환합니다.
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return null;
  } catch (error: any) {
    // 404 Not Found와 같이 예산이 없는 경우, 서버는 에러를 반환할 수 있습니다.
    // 이 경우에도 null을 반환하여 UI에서 "예산 없음"으로 처리하도록 합니다.
    if (error.response && error.response.status === 404) {
      return null;
    }
    // 그 외 다른 에러는 그대로 던져서 상위에서 처리하도록 합니다.
    throw error;
  }
};

/**
 * POST /api/v1/budgets
 * 특정 월의 예산을 생성합니다.
 */
export const createBudget = async (data: CreateBudgetRequest): Promise<BudgetData> => {
  // API 응답이 { message, data } 형태이므로, data 객체를 바로 반환하도록 처리
  const response = await axiosInstance.post<{ data: BudgetData }>('/budgets', data);
  return response.data.data;
};

/**
 * PUT /api/v1/budgets/
 * 특정 월의 예산을 수정합니다.
 */
export const updateBudget = async (budgetId: string, data: UpdateBudgetRequest): Promise<BudgetData> => {
  // ✅ URL 경로에 budgetId를 포함하도록 수정합니다.
  const response = await axiosInstance.put<{ data: BudgetData }>(`/budgets/${budgetId}`, data);
  return response.data.data;
};

/**
 * DELETE /api/v1/budgets/:id
 * 특정 월의 예산을 삭제합니다.
 */
export const deleteBudget = async (budgetId: string): Promise<void> => {
  await axiosInstance.delete(`/budgets/${budgetId}`);
};

/**
 * GET /api/v1/budgets/report
 * 특정 월의 예산 리포트를 조회합니다.
 */
export const fetchBudgetReport = async (month: string): Promise<FetchBudgetReportResponse | null> => {
  try {
    const response = await axiosInstance.get<FetchBudgetReportResponse>('/budgets/report', {
      params: { month },
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null; // 리포트 데이터가 없는 경우 null 반환
    }
    throw error;
  }
};