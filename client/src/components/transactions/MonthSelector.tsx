import { ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';

interface MonthSelectorProps {
  currentMonth: string; // "YYYY-MM"
  onMonthChange: (newMonth: string) => void;
}

export default function MonthSelector({ currentMonth, onMonthChange }: MonthSelectorProps) {
  const month = dayjs(currentMonth);

  const handlePrevMonth = () => {
    onMonthChange(month.subtract(1, 'month').format('YYYY-MM'));
  };

  const handleNextMonth = () => {
    onMonthChange(month.add(1, 'month').format('YYYY-MM'));
  };

  return (
    <div className="flex items-center justify-center space-x-4">
      <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
        <ChevronLeft size={24} />
      </button>
      {/* ✅ 날짜 형식 및 스타일 수정 */}
      <h2 className="text-xl font-bold w-28 text-center tabular-nums">
        {month.format('YYYY.MM')}
      </h2>
      <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
        <ChevronRight size={24} />
      </button>
    </div>
  );
}