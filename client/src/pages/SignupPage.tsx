import React from 'react';
import { Link } from 'react-router-dom';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            <Link to="/">씀씀 (sseumsseum)</Link>
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">새로운 계정을 만들어 시작해 보세요.</p>
        </div>

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">이메일</label>
            <input id="email" name="email" type="email" required className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
          </div>

          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">비밀번호</label>
            <input id="password" name="password" type="password" required className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
          </div>
          
          <div>
            <label htmlFor="confirm-password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">비밀번호 확인</label>
            <input id="confirm-password" name="confirm-password" type="password" required className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
          </div>

          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">닉네임</label>
            <input id="nickname" name="nickname" type="text" required className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
          </div>

          <div>
            <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">생년월일</label>
            <input id="birthdate" name="birthdate" type="date" required className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">성별</label>
            <div className="mt-2 flex items-center space-x-6">
              <label className="flex items-center">
                <input name="gender" type="radio" value="male" required className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">남성</span>
              </label>
              <label className="flex items-center">
                <input name="gender" type="radio" value="female" required className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">여성</span>
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              가입하기
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            로그인하기
          </Link>
        </p>
      </div>
    </div>
  );
}
