import { create } from 'zustand';
import { fetchBudgets, createBudget, updateBudget, deleteBudget, fetchBudgetReport } from '../api/budgetApi';
import type { BudgetData, CreateBudgetRequest, FetchBudgetReportResponse } from '../types/api';

interface BudgetState {
  budgetData: BudgetData | null;
  reportData: FetchBudgetReportResponse | null; // ✅ reportData 상태 추가
  isLoading: boolean;
  error: string | null;
  loadBudgets: (month: string) => Promise<void>;
  addBudget: (data: CreateBudgetRequest) => Promise<void>;
  updateBudget: (budgetId: string, data: CreateBudgetRequest) => Promise<void>;
  deleteBudget: (budgetId: string) => Promise<void>;
}

const useBudgetStore = create<BudgetState>((set, get) => ({
  budgetData: null,
  reportData: null, // ✅ 초기 상태 추가
  isLoading: false,
  error: null,
  
  loadBudgets: async (month) => {
    set({ isLoading: true, error: null, budgetData: null, reportData: null });
    try {
      const [budgetResult, reportResult] = await Promise.all([
        fetchBudgets(month),
        fetchBudgetReport(month)
      ]);
      set({ budgetData: budgetResult, reportData: reportResult, isLoading: false });
    } catch (err) {
      console.error("예산/리포트 데이터 조회 실패:", err);
      set({ error: '데이터 조회에 실패했습니다.', isLoading: false });
    }
  },

  addBudget: async (data) => {
    try {
      await createBudget(data);
      await get().loadBudgets(data.month); 
    } catch (err) {
      console.error("예산 생성 실패:", err);
      throw err;
    }
  },

  updateBudget: async (budgetId, data) => {
    try {
      await updateBudget(budgetId, data); 
      await get().loadBudgets(data.month);
    } catch (err) {
      console.error("예산 수정 실패:", err);
      throw err;
    }
  },

  deleteBudget: async (budgetId) => {
    try {
      await deleteBudget(budgetId);
      // ✅ 삭제 성공 시, budgetData와 reportData를 모두 null로 설정
      set({ budgetData: null, reportData: null });
    } catch (err) {
      console.error("예산 삭제 실패:", err);
      throw err;
    }
  }
}));

export default useBudgetStore;