import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 스토어에서 관리할 상태의 타입을 정의합니다.
interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  login: (token: string) => void;
  logout: () => void;
}

// Zustand 스토어를 생성합니다.
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 초기 상태
      isLoggedIn: false,
      accessToken: null,

      // 로그인 액션: AccessToken만 받아 상태를 업데이트합니다.
      login: (token) => set({ isLoggedIn: true, accessToken: token }),

      // 로그아웃 액션: 상태를 초기화합니다.
      logout: () => set({ isLoggedIn: false, accessToken: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // accessToken과 isLoggedIn 상태만 저장합니다.
      partialize: (state) => ({
        accessToken: state.accessToken,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);

export default useAuthStore;

