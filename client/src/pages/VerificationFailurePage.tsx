import { Link } from 'react-router-dom';
import { LogoIcon } from '../components/icons/LogoIcon';

// 실패 아이콘
const AlertCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

export default function VerificationFailurePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md mx-auto">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <LogoIcon className="w-10 h-10 text-indigo-600" />
          <h1 className="text-3xl font-bold text-indigo-600">씀씀</h1>
        </Link>
        <div className="bg-white p-8 sm:p-12 rounded-xl shadow-md text-center space-y-6">
          <div className="flex justify-center">
            <AlertCircleIcon />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">인증에 실패했습니다</h2>
          <p className="text-gray-600">
            요청하신 인증 링크가 만료되었거나,
            <br />
            올바르지 않은 접근입니다.
          </p>
          <Link
            to="/login"
            className="inline-block w-full px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors"
          >
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
