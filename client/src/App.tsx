import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage'; // 1. 로그인 페이지 import
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
      
      {/* TODO: 여기에 가입 페이지 등 다른 독립 페이지 라우트를 추가하세요 */}
      {/* 예: <Route path="/signup" element={<SignupPage />} /> */}
    </Routes>
  );
}

export default App;
