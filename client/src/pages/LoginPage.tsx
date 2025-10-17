import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import { loginUser, resendVerificationEmail } from '../api/authApi';
import useAuthStore from '../store/authStore';
import type { LoginRequestData } from '../types/api';
import { LogoIcon } from '../components/icons/LogoIcon';
import { Mail, Lock, AlertCircle } from 'lucide-react';

// --- 아이콘 컴포넌트들 ---
const LoadingSpinner = () => (<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);

// ✅ API 메시지를 위한 컴포넌트 추가
const ApiMessage = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
    <AlertCircle className="h-5 w-5" />
    <span>{text}</span>
  </div>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const { login } = useAuthStore();

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<LoginRequestData>({ mode: 'onBlur' });

  const onSubmit: SubmitHandler<LoginRequestData> = async (data) => {
    setIsLoading(true);
    setApiError(null);
    setNeedsVerification(false);
    try {
      const response = await loginUser(data);
      login(response.accessToken);
      navigate('/dashboard');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message;
        if (status === 401) setApiError(message || '이메일 또는 비밀번호가 일치하지 않습니다.');
        else if (status === 403) {
          setApiError(message || '이메일 인증이 완료되지 않았습니다.');
          setNeedsVerification(true);
        } else setApiError(message || '로그인 중 오류가 발생했습니다.');
      } else setApiError('알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const email = getValues('email');
    if (!email) {
      alert('이메일을 먼저 입력해주세요.');
      return;
    }
    try {
      const response = await resendVerificationEmail({ email });
      alert(response.message || '인증 메일이 성공적으로 재전송되었습니다.');
      setNeedsVerification(false);
    } catch (error) {
      alert('메일 재전송 중 오류가 발생했습니다.');
    }
  };
  
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col items-center justify-center bg-indigo-700 text-white p-12">
        <Link to="/" className="flex flex-col items-center gap-4">
          <LogoIcon className="w-24 h-24" />
          <h1 className="text-5xl font-bold">씀씀</h1>
        </Link>
        <p className="mt-6 text-xl text-indigo-200 text-center">
          당신의 똑똑한 지출 관리 파트너, 씀씀과 함께 시작해 보세요.
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 w-full min-h-screen">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="flex items-center justify-center gap-2">
              <LogoIcon className="w-10 h-10 text-indigo-600" />
              <h1 className="text-3xl font-bold text-indigo-600">씀씀</h1>
            </Link>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900">로그인</h2>
            <p className="mt-2 text-gray-600">
              계정이 없으신가요?{' '}
              <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                가입하기
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일 주소</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={20} />
                </div>
                <input
                  id="email" type="email" autoComplete="email"
                  {...register('email', {
                    required: '이메일은 필수 항목입니다.',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: '유효한 이메일 주소를 입력해주세요.',
                    },
                  })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-700">비밀번호</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  id="password" type="password" autoComplete="current-password"
                  {...register('password', { required: '비밀번호는 필수 항목입니다.' })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="********"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  비밀번호를 잊으셨나요?
                </a>
              </div>
            </div>

            {/* ✅ 에러 메시지를 새로운 컴포넌트로 변경 */}
            {apiError && <ApiMessage text={apiError} />}
            
            {needsVerification && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  인증 메일 재전송
                </button>
              </div>
            )}
            
            <div>
              <button 
                type="submit" disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? <LoadingSpinner /> : '로그인'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

