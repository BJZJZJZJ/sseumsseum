import { Link, useNavigate } from 'react-router-dom';
// SubmitHandler를 type-only import로 분리합니다.
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useState } from 'react';
import axios from 'axios';

import type { SignupFormData } from '../types/api';
import { registerUser } from '../api/authApi';

export default function SignupPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    mode: 'onBlur', // 포커스가 해제될 때 유효성 검사
  });

  // 비밀번호 확인을 위해 'password' 필드의 값을 감시합니다.
  const password = watch('password');

  const onSubmit: SubmitHandler<SignupFormData> = async (data) => {
    setIsLoading(true);
    setApiError(null);
    setApiSuccess(null);

    try {
      await registerUser(data);
      setApiSuccess('회원가입이 성공했습니다. 인증 메일이 발송됩니다. 3초 후 로그인 페이지로 이동합니다.');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message;
        
        if (status === 409) {
          setApiError(message || '이미 존재하는 이메일입니다.');
        } else {
          setApiError(message || '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      } else {
        setApiError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="text-3xl font-extrabold text-white">
          씀씀 (sseumsseum)
        </Link>
        <h2 className="mt-6 text-2xl font-bold text-white">
          새로운 계정 만들기
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">이메일</label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email', {
                    required: '이메일은 필수 항목입니다.',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: '유효한 이메일 주소를 입력해주세요.',
                    },
                  })}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white ${errors.email ? 'border-red-500' : 'border-gray-600'}`}
                />
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">비밀번호</label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password', {
                    required: '비밀번호는 필수 항목입니다.',
                    minLength: { value: 8, message: '비밀번호는 8자 이상이어야 합니다.' },
                  })}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white ${errors.password ? 'border-red-500' : 'border-gray-600'}`}
                />
                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">비밀번호 확인</label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmPassword', {
                    required: '비밀번호 확인은 필수 항목입니다.',
                    validate: value => value === password || '비밀번호가 일치하지 않습니다.',
                  })}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white ${errors.confirmPassword ? 'border-red-500' : 'border-gray-600'}`}
                />
                {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* 닉네임 */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-300">닉네임</label>
              <div className="mt-1">
                <input
                  id="nickname"
                  type="text"
                  {...register('nickname', {
                    required: '닉네임은 필수 항목입니다.',
                    minLength: { value: 2, message: '닉네임은 2자 이상이어야 합니다.' },
                  })}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white ${errors.nickname ? 'border-red-500' : 'border-gray-600'}`}
                />
                {errors.nickname && <p className="mt-2 text-sm text-red-600">{errors.nickname.message}</p>}
              </div>
            </div>

            {/* 생년월일 */}
            <div>
              <label htmlFor="birthdate" className="block text-sm font-medium text-gray-300">생년월일</label>
              <div className="mt-1">
                <input
                  id="birthdate"
                  type="date"
                  {...register('birthdate', { required: '생년월일은 필수 항목입니다.' })}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white ${errors.birthdate ? 'border-red-500' : 'border-gray-600'}`}
                />
                {errors.birthdate && <p className="mt-2 text-sm text-red-600">{errors.birthdate.message}</p>}
              </div>
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-sm font-medium text-gray-300">성별</label>
              <div className="mt-2 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="남"
                    {...register('gender', { required: '성별을 선택해주세요.' })}
                    className="form-radio h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-300">남성</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="여"
                    {...register('gender', { required: '성별을 선택해주세요.' })}
                    className="form-radio h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-300">여성</span>
                </label>
              </div>
              {errors.gender && <p className="mt-2 text-sm text-red-600">{errors.gender.message}</p>}
            </div>

            {/* API 메시지 표시 */}
            {apiError && <p className="text-sm text-red-600 text-center">{apiError}</p>}
            {apiSuccess && <p className="text-sm text-green-500 text-center">{apiSuccess}</p>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '가입하는 중...' : '가입하기'}
              </button>
            </div>
          </form>

           <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">이미 계정이 있으신가요?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-gray-200 hover:bg-gray-600"
              >
                로그인
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

