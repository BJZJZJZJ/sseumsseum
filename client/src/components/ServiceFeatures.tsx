import React from 'react';

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
    ),
    title: '간편한 수입/지출 기록',
    description: '언제 어디서든 쉽고 빠르게 금융 활동을 기록하고 관리하세요. 반복되는 내역은 자동으로 입력됩니다.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
    title: '맞춤형 예산 설정',
    description: '카테고리별 예산을 설정하고 목표를 달성해 보세요. 예산 초과 시 알림을 보내드립니다.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.2 12.8A10 10 0 1 1 12 22"/><path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z"/><path d="M12 12v5"/><path d="M12 7v1"/></svg>
    ),
    title: '자동 분류 및 통계',
    description: 'AI가 지출 내역을 자동으로 분류하고, 이해하기 쉬운 차트와 그래프로 소비 패턴을 분석해 드립니다.',
  },
];

export default function ServiceFeatures() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">
            당신의 금융 비서, SmartBudget
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            복잡한 가계부 앱은 이제 그만. 스마트하고 직관적인 기능으로 돈 관리를 즐겁게 만들어 보세요.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-8 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
