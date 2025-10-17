import { create } from 'zustand';
import { fetchFinancialTrendReport, fetchTopSpendingReport, fetchCategoryDetailReport } from '../api/reportApi';
import type { FetchFinancialTrendResponse, FetchTopSpendingResponse, FetchCategoryDetailResponse } from '../types/api';

interface ReportState {
  financialTrend: FetchFinancialTrendResponse | null;
  topSpending: FetchTopSpendingResponse | null;
  categoryDetail: FetchCategoryDetailResponse | null;
  isLoading: boolean;
  isDetailLoading: boolean;
  error: string | null;
  loadReports: (params: { startDate: string, endDate: string }) => Promise<void>;
  loadCategoryDetailReport: (params: { categoryId: string, startDate: string, endDate: string }) => Promise<void>;
}

const useReportStore = create<ReportState>((set) => ({
  financialTrend: null,
  topSpending: null,
  categoryDetail: null,
  isLoading: false,
  isDetailLoading: false,
  error: null,

  loadReports: async ({ startDate, endDate }) => {
    set({ isLoading: true, error: null });
    try {
      // ✅ 두 개의 리포트를 동시에 병렬로 요청
      const [trendResult, topSpendingResult] = await Promise.all([
        fetchFinancialTrendReport({ startDate, endDate }),
        fetchTopSpendingReport({ startDate, endDate }),
      ]);
      set({ 
        financialTrend: trendResult, 
        topSpending: topSpendingResult, 
        isLoading: false 
      });
    } catch (err: any) {
      console.error("리포트 조회 실패:", err);
      set({ 
        error: '리포트 조회에 실패했습니다.', 
        isLoading: false,
        financialTrend: null,
        topSpending: null,
      });
    }
  },

  loadCategoryDetailReport: async ({ categoryId, startDate, endDate }) => {
    set({ isDetailLoading: true, error: null });
    try {
      const data = await fetchCategoryDetailReport({ categoryId, startDate, endDate });
      set({ categoryDetail: data, isDetailLoading: false });
    } catch (err: any) {
      console.error("카테고리 상세 보고서 조회 실패:", err);
      set({ error: '상세 보고서 조회에 실패했습니다.', isDetailLoading: false, categoryDetail: null });
    }
  },
}));

export default useReportStore;