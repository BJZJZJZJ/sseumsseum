import { NavLink } from 'react-router-dom';
import useUserStore from '../../store/userStore';
// LogoIcon은 더 이상 사용되지 않으므로 import에서 제거합니다.
import { LayoutDashboard, List, Target, BarChart2, User, Settings } from 'lucide-react';

const navLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: '대시보드' },
  { to: '/transactions', icon: List, label: '거래 내역' },
  { to: '/budget', icon: Target, label: '월 예산 설정' },
  { to: '/report', icon: BarChart2, label: '월간 리포트' },
  { to: '/categories', icon: Settings, label: '카테고리 관리'},
  { to: '/mypage', icon: User, label: '마이페이지' },
];

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const { profile } = useUserStore();

  const linkClasses = "flex items-center px-4 py-2.5 rounded-lg transition-colors";
  const activeLinkClasses = "bg-indigo-100 text-indigo-600 font-semibold";
  const inactiveLinkClasses = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

  return (
    <aside className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-30 lg:relative lg:translate-x-0 flex flex-col`}>
      {/* ✅ Navbar와의 시각적 정렬을 위해 공간은 유지하되, 중복되는 로고 링크는 제거했습니다. */}
      <div className="h-16 border-b" />
      
      <div className="flex-grow flex flex-col p-4">
        {/* 사용자 정보 */}
        <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-gray-50">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
            {profile ? profile.user.nickname.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold truncate">{profile?.user.nickname}</p>
            <p className="text-sm text-gray-500 truncate">{profile?.user.email}</p>
          </div>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 space-y-2">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
            >
              <Icon size={20} className="mr-3" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}

