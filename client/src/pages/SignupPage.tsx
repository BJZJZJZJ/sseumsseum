import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useState } from 'react';
import axios from 'axios';
import type { SignupFormData } from '../types/api';
import { registerUser } from '../api/authApi';
import { LogoIcon } from '../components/icons/LogoIcon';

// --- 아이콘 컴포넌트들 ---
const MailIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>);
const LockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>);
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const CalendarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const LoadingSpinner = () => (<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);


export default function SignupPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<SignupFormData>({ mode: 'onBlur' });
  const password = watch('password');

  const onSubmit: SubmitHandler<SignupFormData> = async (data) => {
    setIsLoading(true);
    setApiError(null);
    setApiSuccess(null);
    try {
      await registerUser(data);
      setApiSuccess('회원가입이 완료되었습니다! 확인 메일이 발송되었으니, 인증 후 로그인해주세요.');
      setTimeout(() => navigate('/login'), 5000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        setApiError(message || '회원가입 중 오류가 발생했습니다.');
      } else {
        setApiError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
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
          단 몇 단계만으로, 당신의 현명한 금융 생활이 시작됩니다.
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
            <h2 className="text-3xl font-bold text-gray-900">회원가입</h2>
            <p className="mt-2 text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                로그인
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* 계정 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">계정 정보</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">이메일</label>
                <div className="mt-1 relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><MailIcon /></div>
                  <input type="email" {...register('email', { required: '이메일은 필수입니다.', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: '유효한 이메일 주소를 입력해주세요.' } })} className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">비밀번호</label>
                <div className="mt-1 relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><LockIcon /></div>
                  <input type="password" {...register('password', { required: '비밀번호는 필수입니다.', minLength: { value: 8, message: '비밀번호는 8자 이상이어야 합니다.' } })} className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm ${errors.password ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
                 <div className="mt-1 relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><LockIcon /></div>
                  <input type="password" {...register('confirmPassword', { required: '비밀번호를 다시 입력해주세요.', validate: value => value === password || '비밀번호가 일치하지 않습니다.' })} className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* 개인 정보 */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">개인 정보</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">닉네임</label>
                <div className="mt-1 relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><UserIcon /></div>
                  <input type="text" {...register('nickname', { required: '닉네임은 필수입니다.', minLength: { value: 2, message: '닉네임은 2자 이상이어야 합니다.' } })} className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm ${errors.nickname ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
                {errors.nickname && <p className="mt-1 text-sm text-red-500">{errors.nickname.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">생년월일</label>
                <div className="mt-1 relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><CalendarIcon /></div>
                  <input type="date" {...register('birthdate', { required: '생년월일을 선택해주세요.' })} className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm ${errors.birthdate ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
                {errors.birthdate && <p className="mt-1 text-sm text-red-500">{errors.birthdate.message}</p>}
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700">성별</label>
                 <div className="mt-2 grid grid-cols-2 gap-3">
                    <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer ${watch('gender') === '남' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white'}`}>
                      <input type="radio" value="남" {...register('gender', { required: '성별을 선택해주세요.' })} className="sr-only" />
                      남성
                    </label>
                    <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer ${watch('gender') === '여' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white'}`}>
                      <input type="radio" value="여" {...register('gender', { required: '성별을 선택해주세요.' })} className="sr-only" />
                      여성
                    </label>
                 </div>
                 {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender.message}</p>}
              </div>
            </div>

            {apiError && <p className="text-sm text-red-500 text-center">{apiError}</p>}
            {apiSuccess && <p className="text-sm text-green-600 text-center">{apiSuccess}</p>}
            
            <div>
              <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50">
                {isLoading ? <LoadingSpinner /> : '가입하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
