import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage'; // 1. 회원가입 페이지 import
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <Routes>
      {/* Navbar와 Footer가 포함된 페이지들 */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* 레이아웃이 없는 독립적인 페이지들 */}
      <Route path="/login" element={<LoginPage />} /> 
      <Route path="/signup" element={<SignupPage />} /> {/* 2. 라우트 추가 */}
    </Routes>
  );
}

export default App;
