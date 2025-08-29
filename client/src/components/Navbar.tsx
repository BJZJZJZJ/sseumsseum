import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../api/authApi';
import useAuthStore from '../store/authStore';

export default function Navbar() {
  const navigate = useNavigate();
  // Zustand 스토어에서 로그인 상태와 로그아웃 함수를 가져옵니다.
  const { isLoggedIn, logout } = useAuthStore();

  const handleLogout = async () => {
    // 사용자에게 로그아웃 여부를 다시 한번 확인받습니다.
    if (!window.confirm('정말 로그아웃 하시겠습니까?')) return;

    try {
      await logoutUser();
      logout(); // 스토어의 상태를 로그아웃으로 변경합니다.
      alert('로그아웃 되었습니다.');
      navigate('/'); // 로그아웃 후 홈으로 이동
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // 토큰 만료 등의 이유로 서버에서 로그아웃 실패 시에도 클라이언트 상태는 로그아웃 처리
      logout();
      alert('로그아웃 처리 중 오류가 발생했습니다. 클라이언트의 로그인 정보를 삭제합니다.');
      navigate('/');
    }
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-white hover:text-gray-300">
              씀씀 (sseumsseum)
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              // 로그인 상태일 때 로그아웃 버튼 표시
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                로그아웃
              </button>
            ) : (
              // 로그아웃 상태일 때 로그인/가입 버튼 표시
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-300 hover:text-white"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  가입하기
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

