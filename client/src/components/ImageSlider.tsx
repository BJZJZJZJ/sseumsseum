import { useState, useEffect, useCallback } from 'react';

const slides = [
  {
    image: 'https://placehold.co/1200x500/6366f1/ffffff?text=Smart+Budgeting',
    title: '스마트한 자산 관리의 시작',
    subtitle: '수입과 지출을 한눈에 파악하고 현명한 소비 습관을 만드세요.',
  },
  {
    image: 'https://placehold.co/1200x500/ec4899/ffffff?text=Easy+Tracking',
    title: '간편한 지출 내역 추적',
    subtitle: '카드 내역, 현금 사용 내역을 손쉽게 기록하고 분류할 수 있습니다.',
  },
  {
    image: 'https://placehold.co/1200x500/10b981/ffffff?text=Insightful+Reports',
    title: '한눈에 보는 금융 리포트',
    subtitle: '주간, 월간 리포트를 통해 나의 금융 건강 상태를 확인하세요.',
  },
];

export default function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
  }, []);

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000); // 5초마다 슬라이드 변경
    return () => clearInterval(slideInterval);
  }, [nextSlide]);

  return (
    <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden">
      <div
        style={{ backgroundImage: `url(${slides[currentIndex].image})` }}
        className="w-full h-full bg-center bg-cover duration-500 transition-all"
      ></div>
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
        <div className="text-center text-white p-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {slides[currentIndex].title}
          </h1>
          <p className="text-lg md:text-xl">
            {slides[currentIndex].subtitle}
          </p>
        </div>
      </div>
      <button onClick={prevSlide} className="absolute top-1/2 left-5 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button onClick={nextSlide} className="absolute top-1/2 right-5 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
      </button>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, slideIndex) => (
          <div
            key={slideIndex}
            onClick={() => setCurrentIndex(slideIndex)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all ${currentIndex === slideIndex ? 'bg-white' : 'bg-white/50'}`}
          ></div>
        ))}
      </div>
    </div>
  );
}
