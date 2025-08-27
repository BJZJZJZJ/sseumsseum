import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <Routes>
      {/* MainLayout은 Navbar와 Footer를 포함하고 있습니다. */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        {/* TODO: 여기에 다른 페이지 라우트를 추가하세요 */}
        {/* 예: <Route path="/login" element={<LoginPage />} /> */}
      </Route>
    </Routes>
  );
}

export default App;
