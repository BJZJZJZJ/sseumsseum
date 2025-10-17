import { create } from 'zustand';
import { fetchDashboardData } from '../api/dashboardApi';
import type { DashboardData } from '../types/api';

interface DashboardState {
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  loadDashboardData: () => Promise<void>;
}

const useDashboardStore = create<DashboardState>((set) => ({
  dashboardData: null,
  isLoading: false,
  error: null,
  
  loadDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchDashboardData();
      set({ dashboardData: data, isLoading: false });
    } catch (err) {
      console.error("대시보드 데이터 조회 실패:", err);
      set({ error: '대시보드 데이터를 불러오는데 실패했습니다.', isLoading: false });
    }
  },
}));

export default useDashboardStore;