import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../api/authApi';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import { LogoIcon } from './icons/LogoIcon';
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react';
import { User, LogOut, LayoutDashboard } from 'lucide-react';

const HamburgerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;

interface NavbarProps {
  onHamburgerClick: () => void;
}

export default function Navbar({ onHamburgerClick }: NavbarProps) {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuthStore();
  const { profile } = useUserStore();

  const handleLogout = async () => {
    if (!window.confirm('정말 로그아웃 하시겠습니까?')) return;
    try {
      await logoutUser();
      logout();
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 flex-shrink-0 z-10 shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {isLoggedIn && (
              <button onClick={onHamburgerClick} className="lg:hidden text-gray-500 mr-4">
                <HamburgerIcon />
              </button>
            )}
            <div className="flex-shrink-0">
              {/* ✅ 로그인 상태에 따라 링크를 동적으로 변경 */}
              <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                <LogoIcon className="w-8 h-8" />
                <span className="hidden sm:inline">씀씀</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <Menu as="div" className="relative">
                <MenuButton className="flex items-center justify-center w-10 h-10 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700">
                  {profile ? profile.user.nickname.charAt(0).toUpperCase() : '?'}
                </MenuButton>
                <Transition enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                  <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-1 py-1">
                       <MenuItem>
                        <Link to="/dashboard" className="group flex rounded-md items-center w-full px-2 py-2 text-sm text-gray-700 data-[active]:bg-gray-100">
                          <LayoutDashboard className="w-5 h-5 mr-2 text-gray-400" /> 대시보드
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <Link to="/mypage" className="group flex rounded-md items-center w-full px-2 py-2 text-sm text-gray-700 data-[active]:bg-gray-100">
                          <User className="w-5 h-5 mr-2 text-gray-400" /> 마이페이지
                        </Link>
                      </MenuItem>
                    </div>
                    <div className="px-1 py-1">
                      <MenuItem>
                        <button onClick={handleLogout} className="group flex rounded-md items-center w-full px-2 py-2 text-sm text-red-600 data-[active]:bg-red-50">
                          <LogOut className="w-5 h-5 mr-2" /> 로그아웃
                        </button>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Transition>
              </Menu>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600">
                  로그인
                </Link>
                <Link to="/signup" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700">
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

