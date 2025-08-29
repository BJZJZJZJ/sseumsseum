import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import axios from 'axios';

import type { LoginRequestData } from '../types/api';
import { loginUser } from '../api/authApi';

// 소셜 로그인 아이콘 (SVG)
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.521-3.108-11.127-7.481l-6.571 4.819C9.656 39.663 16.318 44 24 44z"></path>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.836 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
  </svg>
);

const KakaoIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 32 32">
        <path fill="#3C1E1E" d="M16 4.64c-6.96 0-12.64 4.48-12.64 10.08 0 3.52 2.32 6.64 5.76 8.48l-2.08 7.52 7.92-4.16c.96.08 2 .16 3.04.16 6.96 0 12.64-4.48 12.64-10.08S22.96 4.64 16 4.64z"></path>
    </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequestData>({ mode: 'onBlur' });

  const onSubmit: SubmitHandler<LoginRequestData> = async (data) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await loginUser(data);
      console.log('Access Token:', response.accessToken);
      navigate('/dashboard'); // 로그인 성공 시 대시보드 페이지로 이동
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        if (status === 401) {
          setApiError(message || '이메일 또는 비밀번호가 일치하지 않습니다.');
        } else if (status === 403) {
          setApiError(message || '이메일 인증이 완료되지 않았습니다.');
        } else {
          setApiError(message || '로그인 중 오류가 발생했습니다.');
        }
      } else {
        setApiError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            <Link to="/">씀씀 (sseumsseum)</Link>
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">다시 오신 것을 환영합니다!</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              이메일 주소
            </label>
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 ${errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                placeholder="you@example.com"
              />
               {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              비밀번호
            </label>
            <div className="mt-1">
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password', { required: '비밀번호는 필수 항목입니다.' })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 ${errors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                placeholder="********"
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                로그인 유지
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                비밀번호를 잊으셨나요?
              </a>
            </div>
          </div>

          {apiError && <p className="text-sm text-red-500 text-center">{apiError}</p>}

          <div>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">또는</span>
          </div>
        </div>

        <div className="space-y-3">
            <button type="button" className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                <GoogleIcon />
                <span className="ml-2">Google 계정으로 로그인</span>
            </button>
             <button type="button" className="w-full inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm bg-[#FEE500] text-sm font-medium text-black hover:bg-yellow-400">
                <KakaoIcon />
                <span className="ml-2">카카오 계정으로 로그인</span>
            </button>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            가입하기
          </Link>
        </p>
      </div>
    </div>
  );
}

