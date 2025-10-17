import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// --- 페이지 컴포넌트 동적 로딩(Dynamic Import)으로 변경 ---

// 공개 페이지
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const VerificationSuccessPage = lazy(() => import('./pages/VerificationSuccessPage'));
const VerificationFailurePage = lazy(() => import('./pages/VerificationFailurePage'));

// 보호된 페이지 (대시보드)
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const MyPage = lazy(() => import('./pages/dashboard/MyPage'));
const TransactionPage = lazy(() => import('./pages/dashboard/TransactionPage'));
const CategoryPage = lazy(() => import('./pages/dashboard/CategoryPage'));
const BudgetPage = lazy(() => import('./pages/dashboard/BudgetPage'));
const ReportPage = lazy(() => import('./pages/dashboard/ReportPage'));

// 페이지 로딩 중에 보여줄 간단한 UI
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div>페이지를 불러오는 중...</div>
  </div>
);

export default function App() {
  return (
    // Suspense는 동적으로 로딩되는 컴포넌트가 준비될 때까지 fallback UI를 보여줍니다.
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verification-success" element={<VerificationSuccessPage />} />
        <Route path="/verification-failure" element={<VerificationFailurePage />} />

        {/* Landing Page with layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/transactions" element={<TransactionPage />} />
            <Route path="/categories" element={<CategoryPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/report" element={<ReportPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

