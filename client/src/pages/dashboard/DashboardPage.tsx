import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useDashboardStore from '../../store/dashboardStore';
import useUserStore from '../../store/userStore';
import MonthlyTrendLineChart from '../../components/dashboard/MonthlyTrendLineChart';
import SpendingPieChart from '../../components/dashboard/SpendingPieChart';
import { TrendingUp, TrendingDown, Minus, Info, PlusCircle, Target } from 'lucide-react';

// 요약 정보를 표시할 카드 컴포넌트
const SummaryCard = ({ title, value, comparison }: { title: string; value: string; comparison?: number }) => {
  const isIncrease = comparison !== undefined && comparison > 0;
  const isSame = comparison === 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-800">{value}</p>
      {comparison !== undefined && (
        <div className={`mt-2 flex items-center text-sm ${isIncrease ? 'text-red-600' : 'text-blue-600'}`}>
          {isIncrease ? <TrendingUp size={16} /> : isSame ? <Minus size={16} /> : <TrendingDown size={16} />}
          <span className="ml-1 font-semibold">{Math.abs(comparison).toFixed(2)}%</span>
          <span className="ml-1 text-gray-500">지난달 대비</span>
        </div>
      )}
    </div>
  );
};

export default function DashboardPage() {
  const { profile } = useUserStore();
  const { dashboardData, isLoading, loadDashboardData } = useDashboardStore();

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (isLoading || !dashboardData) {
    return (
      <div className="space-y-6">
         <h1 className="text-3xl font-bold text-gray-800">안녕하세요, {profile?.user.nickname || '사용자'}님!</h1>
         <div className="text-center py-12">대시보드 데이터를 불러오는 중...</div>
      </div>
    );
  }

  const { summary, dailySpent, categorySpent, advice } = dashboardData;

  return (
    <div className="space-y-8">
      {/* 1. 환영 메시지 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">안녕하세요, {profile?.user.nickname || '사용자'}님!</h1>
        <p className="mt-1 text-gray-600">오늘의 금융 현황을 한눈에 확인해 보세요.</p>
      </div>

      {/* 2. 요약 카드 및 빠른 실행 버튼 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="이번 달 총 지출"
          value={`${summary.currentMonthSpent.toLocaleString()}원`}
          comparison={summary.comparison}
        />
        <SummaryCard 
          title="지난달 총 지출"
          value={`${summary.previousMonthSpent.toLocaleString()}원`}
        />
        <Link to="/transactions" className="flex items-center justify-center gap-3 bg-indigo-600 text-white p-6 rounded-xl shadow-md hover:bg-indigo-700 transition-transform transform hover:scale-105">
          <PlusCircle size={32} />
          <span className="text-lg font-semibold">거래 추가</span>
        </Link>
        <Link to="/budget" className="flex items-center justify-center gap-3 bg-gray-700 text-white p-6 rounded-xl shadow-md hover:bg-gray-800 transition-transform transform hover:scale-105">
          <Target size={32} />
          <span className="text-lg font-semibold">예산 설정</span>
        </Link>
      </div>

      {/* 3. 금융 조언 */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">{advice}</p>
          </div>
        </div>
      </div>

      {/* 4. 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white p-4 rounded-xl shadow-md">
          <MonthlyTrendLineChart data={dailySpent} />
        </div>
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-md">
          <SpendingPieChart data={categorySpent} />
        </div>
      </div>
    </div>
  );
}
