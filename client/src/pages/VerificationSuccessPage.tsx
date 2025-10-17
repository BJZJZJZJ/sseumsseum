import { Link } from 'react-router-dom';
import { LogoIcon } from '../components/icons/LogoIcon';

// 성공 아이콘
const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default function VerificationSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md mx-auto">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <LogoIcon className="w-10 h-10 text-indigo-600" />
          <h1 className="text-3xl font-bold text-indigo-600">씀씀</h1>
        </Link>
        <div className="bg-white p-8 sm:p-12 rounded-xl shadow-md text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircleIcon />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">인증이 완료되었습니다!</h2>
          <p className="text-gray-600">
            씀씀의 회원이 되신 것을 환영합니다.
            <br />
            이제 모든 서비스를 이용하실 수 있습니다.
          </p>
          <Link
            to="/login"
            className="inline-block w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
          >
            로그인 하러 가기
          </Link>
        </div>
      </div>
    </div>
  );
}
