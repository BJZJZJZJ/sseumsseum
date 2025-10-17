import { create } from 'zustand';
import type { UserProfileResponse } from '../types/api';
import { fetchUserProfile } from '../api/userApi';

interface UserState {
  profile: UserProfileResponse | null;
  isLoading: boolean;
  error: string | null;
  loadUserProfile: () => Promise<void>;
  updateProfileState: (newProfile: UserProfileResponse) => void;
  clearProfile: () => void;
}

const useUserStore = create<UserState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,
  loadUserProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const userProfile = await fetchUserProfile();
      set({ profile: userProfile, isLoading: false });
    } catch (err: any) {
      // 401 에러는 axios 인터셉터가 처리할 것이므로, 여기서는 아무것도 하지 않습니다.
      // 이렇게 해야 재렌더링 -> 무한 루프를 막을 수 있습니다.
      if (err.response?.status !== 401) {
        set({ error: '사용자 정보를 불러오는 데 실패했습니다.', isLoading: false });
      } else {
        // 401 에러의 경우, 로딩 상태만 false로 되돌려
        // ProtectedRoute의 로딩 화면이 무한히 표시되는 것을 방지합니다.
        set({ isLoading: false });
      }
    }
  },
  updateProfileState: (newProfile) => set({ profile: newProfile }),
  clearProfile: () => set({ profile: null }),
}));

export default useUserStore;

