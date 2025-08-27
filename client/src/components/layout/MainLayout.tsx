import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';

export default function MainLayout() {
  return (
    // 1. flex 컨테이너로 만들고, 최소 높이를 화면 전체로 설정합니다.
    <div className="flex flex-col min-h-screen font-sans antialiased text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-800">
      <Navbar />
      {/* 2. main 영역이 남은 공간을 모두 차지하도록 설정합니다. */}
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="py-8 text-center text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} SmartBudget. All rights reserved.</p>
      </footer>
    </div>
  );
}
