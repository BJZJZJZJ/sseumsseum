import { useState, forwardRef } from 'react';
import dayjs from 'dayjs';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

registerLocale('ko', ko); // datepicker에 한글 로케일 등록

// DatePicker의 입력창을 커스텀 디자인하기 위한 컴포넌트
const CustomDateInput = forwardRef<HTMLButtonElement, { value?: string, onClick?: () => void }>(
  ({ value, onClick }, ref) => (
    <button 
      className="flex items-center justify-between w-full p-2 bg-white border border-gray-300 rounded-md shadow-sm text-left hover:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
      onClick={onClick} 
      ref={ref}
    >
      <span>{value}</span>
      <Calendar className="w-4 h-4 text-gray-500" />
    </button>
  )
);

interface DateRangeSelectorProps {
  onSearch: (start: string, end: string) => void;
}

export default function DateRangeSelector({ onSearch }: DateRangeSelectorProps) {
  const [startDate, setStartDate] = useState<Date>(dayjs().startOf('month').toDate());
  const [endDate, setEndDate] = useState<Date>(dayjs().endOf('month').toDate());

  const handleSearch = () => {
    // ✅ 유효성 검사 로직 추가
    if (dayjs(startDate).isSame(dayjs(endDate), 'month')) {
      alert('시작 월과 종료 월은 같을 수 없습니다. 다른 월을 선택해주세요.');
      return; // 조회 실행 중단
    }
    
    // isSameOrAfter를 사용하려면 dayjs 플러그인이 필요하지만,
    // DatePicker의 min/maxDate 옵션이 이미 처리해주므로 여기서는 생략 가능합니다.

    onSearch(
      dayjs(startDate).startOf('month').format('YYYY-MM-DD'),
      dayjs(endDate).endOf('month').format('YYYY-MM-DD')
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
      <div className="w-full sm:w-36">
        <DatePicker
          locale="ko"
          selected={startDate}
          onChange={(date: Date | null) => date && setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          maxDate={endDate} // ✅ 종료일 이후의 날짜는 선택할 수 없도록 설정
          dateFormat="yyyy.MM"
          showMonthYearPicker
          customInput={<CustomDateInput />}
        />
      </div>
      <span className="hidden sm:inline text-gray-500">~</span>
      <div className="w-full sm:w-36">
        <DatePicker
          locale="ko"
          selected={endDate}
          onChange={(date: Date | null) => date && setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate} // 시작일 이전의 날짜는 선택할 수 없도록 설정
          dateFormat="yyyy.MM"
          showMonthYearPicker
          customInput={<CustomDateInput />}
        />
      </div>
      <button 
        onClick={handleSearch} 
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 w-full sm:w-auto whitespace-nowrap"
      >
        조회
      </button>
    </div>
  );
}