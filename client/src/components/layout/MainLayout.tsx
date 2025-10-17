import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import Sidebar from '../dashboard/Sidebar';

const dashboardPaths = [
  '/dashboard',
  '/mypage',
  '/transactions',
  '/categories',
  '/budget',
  '/report',
];

export default function MainLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isDashboardArea = dashboardPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="flex h-screen bg-white">
      {isDashboardArea && <Sidebar isOpen={isSidebarOpen} />}

      {isSidebarOpen && isDashboardArea && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
          aria-hidden="true"
        ></div>
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onHamburgerClick={() => setSidebarOpen(true)} />
        
        <main className={`flex-1 overflow-x-hidden overflow-y-auto ${isDashboardArea ? 'bg-gray-50 p-6' : ''}`}>
          <Outlet />
        </main>
        
        {!isDashboardArea && (
          <footer className="bg-gray-50 text-gray-500 text-center p-6 border-t">
            <p>&copy; {new Date().getFullYear()} 씀씀 (sseumsseum). All rights reserved.</p>
          </footer>
        )}
      </div>
    </div>
  );
}

