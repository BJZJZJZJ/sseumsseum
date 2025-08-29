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
  // persist 미들웨어를 사용하여 상태를 localStorage에 저장합니다.
  persist(
    (set) => ({
      // 초기 상태
      isLoggedIn: false,
      accessToken: null,

      // 로그인 액션: 토큰을 받아 상태를 업데이트합니다.
      login: (token) => set({ isLoggedIn: true, accessToken: token }),

      // 로그아웃 액션: 상태를 초기화합니다.
      logout: () => set({ isLoggedIn: false, accessToken: null }),
    }),
    {
      name: 'auth-storage', // localStorage에 저장될 때 사용될 키 이름
      storage: createJSONStorage(() => localStorage), // (optional) 로컬 스토리지를 사용
      // `accessToken`과 `isLoggedIn` 상태만 저장하고, 함수(login, logout)는 제외합니다.
      partialize: (state) => ({
        accessToken: state.accessToken,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);

export default useAuthStore;
