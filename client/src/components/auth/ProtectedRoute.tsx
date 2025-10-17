import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import useUserStore from '../../store/userStore';

export default function ProtectedRoute() {
  const { isLoggedIn } = useAuthStore();
  const { profile, loadUserProfile } = useUserStore();
  // API 최초 호출을 추적하기 위한 상태
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);

  useEffect(() => {
    // 로그인 되어 있고, 프로필이 없으며, 아직 첫 시도를 하지 않았을 때만 API를 호출합니다.
    // 이 조건은 무한 루프를 완벽하게 방지합니다.
    if (isLoggedIn && !profile && !initialLoadAttempted) {
      setInitialLoadAttempted(true); // 호출 시도 플래그를 즉시 true로 설정
      loadUserProfile();
    }
  }, [isLoggedIn, profile, initialLoadAttempted, loadUserProfile]);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // 최초 프로필 로딩 중에는 로딩 화면을 보여줍니다.
  if (isLoggedIn && !profile) {
     return (
      <div className="flex h-screen items-center justify-center">
        <div>사용자 정보를 불러오는 중...</div>
      </div>
    );
  }

  return <Outlet />;
}

