import { Link } from 'react-router-dom';
import { LogoIcon } from '../components/icons/LogoIcon';
import ServiceFeatures from '../components/ServiceFeatures';
import { ChevronDown } from 'lucide-react';

// 1. 히어로 섹션
const HeroSection = () => (
  <section className="relative bg-indigo-700 text-white text-center py-20 sm:py-32 overflow-hidden">
    {/* 배경 장식 요소 */}
    <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/30 blur-2xl"></div>
    <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-purple-500/30 blur-2xl"></div>

    <div className="container mx-auto px-6 relative z-10">
      <LogoIcon className="w-24 h-24 mx-auto mb-4" />
      <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
        흩어지는 돈, 똑똑하게 씀씀
      </h1>
      <p className="mt-6 text-lg sm:text-xl text-indigo-200 max-w-2xl mx-auto">
        복잡한 가계부는 이제 그만. 당신의 지출 습관을 한눈에 파악하고, 현명한 금융 생활을 시작해 보세요.
      </p>
      <div className="mt-10 flex justify-center gap-4">
        <Link 
          to="/signup" 
          className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-transform transform hover:scale-105"
        >
          무료로 시작하기
        </Link>
        <Link 
          to="/login" 
          className="px-8 py-3 text-white font-semibold rounded-lg border border-indigo-400 hover:bg-indigo-600 transition-colors"
        >
          로그인
        </Link>
      </div>
    </div>
  </section>
);

// 2. 시각적 특징 소개 섹션
const VisualShowcase = () => (
  <section className="py-16 sm:py-24 bg-gray-50">
    <div className="container mx-auto px-6">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">한눈에 보는 나의 금융 현황</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          대시보드를 통해 월별 지출 추이와 카테고리별 소비를 직관적으로 확인하세요.
        </p>
      </div>
      <div className="mt-12">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl ring-1 ring-gray-900/10">
          <div className="flex items-center gap-2 mb-4 px-2">
            <span className="w-3 h-3 bg-red-400 rounded-full"></span>
            <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
            <span className="w-3 h-3 bg-green-400 rounded-full"></span>
          </div>
          <img 
            src="/images/dashboard-screenshot.png"
            alt="씀씀 대시보드 스크린샷"
            className="rounded-lg"
          />
        </div>
      </div>
    </div>
  </section>
);

// 3. 자주 묻는 질문 (FAQ) 섹션
const FaqSection = () => {
  const faqs = [
    { q: '씀씀 서비스는 무료인가요?', a: '네, 씀씀의 모든 핵심 기능은 평생 무료로 제공됩니다. 광고 없이 쾌적하게 이용하세요.' },
    { q: '데이터는 안전하게 보관되나요?', a: '네, 당신의 금융 데이터는 최신 보안 기술로 암호화되어 안전하게 관리됩니다. 저희는 당신의 동의 없이 절대 데이터를 외부로 공유하지 않습니다.' },
    { q: '카드 내역을 자동으로 불러올 수 있나요?', a: '현재는 수동 입력을 지원하고 있으며, 향후 주요 카드사 및 은행 연동을 통해 자동 불러오기 기능을 업데이트할 예정입니다.' },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">자주 묻는 질문</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details key={index} className="p-4 border rounded-lg group">
              <summary className="flex justify-between items-center font-semibold cursor-pointer">
                {faq.q}
                <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-gray-600">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

// 4. 마지막 행동 유도 (Final CTA) 섹션
const FinalCtaSection = () => (
  <section className="bg-gray-800">
    <div className="container mx-auto px-6 py-16 text-center">
      <h2 className="text-3xl font-bold text-white">지금 바로 시작해 보세요</h2>
      <p className="mt-4 text-gray-300 max-w-xl mx-auto">
        더 이상 미루지 마세요. '씀씀'과 함께 오늘부터 당신의 금융 건강을 챙겨보세요.
      </p>
      <div className="mt-8">
        <Link 
          to="/signup" 
          className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 transition-transform transform hover:scale-105"
        >
          무료로 가입하고 시작하기
        </Link>
      </div>
    </div>
  </section>
);


export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <VisualShowcase />
      <ServiceFeatures />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
