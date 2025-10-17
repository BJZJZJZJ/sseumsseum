import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import useReportStore from '../../store/reportStore';
import useCategoryStore from '../../store/categoryStore';
import DateRangeSelector from '../../components/dashboard/DateRangeSelector';
import type { FinancialTrendData, ReportCategoryBreakdown, TopSpendingItem } from '../../types/api';
import { generateColors } from '../../utils/colors';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// --- 내부 컴포넌트들 (디자인 개선) ---

const FinancialTrendSummary = ({ data }: { data: FinancialTrendData }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h2 className="text-xl font-bold text-gray-800 mb-4">재무 추이 요약</h2>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm font-medium text-blue-800">총 수입</p>
        <p className="text-2xl font-bold text-blue-600 mt-1">{data.summary.totalIncome.toLocaleString()}원</p>
      </div>
      <div className="p-4 bg-red-50 rounded-lg border border-red-100">
        <p className="text-sm font-medium text-red-800">총 지출</p>
        <p className="text-2xl font-bold text-red-600 mt-1">{data.summary.totalExpense.toLocaleString()}원</p>
      </div>
      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
        <p className="text-sm font-medium text-green-800">순저축</p>
        <p className="text-2xl font-bold text-green-600 mt-1">{data.summary.netProfit.toLocaleString()}원</p>
      </div>
    </div>
  </div>
);

const MonthlyExpenseChart = ({ breakdown }: { breakdown: ReportCategoryBreakdown[] }) => {
  const monthlyExpenses: { [key: string]: number } = {};
  
  breakdown.forEach(item => {
    if (item.type === 'expense') {
      const month = dayjs(item.period).format('YYYY-MM');
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + item.amount;
    }
  });

  const labels = Object.keys(monthlyExpenses).sort();
  const data = labels.map(label => monthlyExpenses[label]);

  const chartData = {
    labels,
    datasets: [{
      label: '월별 총 지출',
      data,
      backgroundColor: 'rgba(239, 68, 68, 0.6)',
      borderRadius: 4,
    }],
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">월별 지출 추이</h2>
      <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
    </div>
  );
};

const TopSpendingSection = ({ data }: { data: TopSpendingItem[] }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h2 className="text-xl font-bold text-gray-800 mb-4">상위 지출 항목</h2>
    <ul className="space-y-2 max-h-96 overflow-y-auto">
      {data.sort((a, b) => b.totalSpent - a.totalSpent).map((item, index) => (
        <li key={item.description + item.categoryId} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold flex-shrink-0">{index + 1}</span>
          <div className="flex-grow overflow-hidden">
            <p className="font-semibold truncate">{item.description}</p>
            <p className="text-sm text-gray-500">{item.categoryName} ({item.count}회)</p>
          </div>
          <p className="font-bold text-red-600 whitespace-nowrap">-{item.totalSpent.toLocaleString()}원</p>
        </li>
      ))}
    </ul>
  </div>
);

const CategoryDetailSection = ({ dateRange }: { dateRange: { startDate: string, endDate: string } }) => {
  const { majorCategories, loadUserCategories } = useCategoryStore();
  const { categoryDetail, isDetailLoading, loadCategoryDetailReport } = useReportStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  useEffect(() => {
    if (majorCategories.length === 0) {
      loadUserCategories();
    }
  }, [loadUserCategories, majorCategories.length]);

  useEffect(() => {
    if (majorCategories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(majorCategories[0].id);
    }
  }, [majorCategories, selectedCategoryId]);

  useEffect(() => {
    if (selectedCategoryId) {
      loadCategoryDetailReport({ categoryId: selectedCategoryId, ...dateRange });
    }
  }, [selectedCategoryId, dateRange, loadCategoryDetailReport]);
  
  const chartData = {
    labels: categoryDetail?.data.map(item => item.subCategoryName) || [],
    datasets: [{
      data: categoryDetail?.data.map(item => item.totalSpent) || [],
      backgroundColor: generateColors(categoryDetail?.data.length || 0),
      borderColor: '#fff',
      borderWidth: 2,
    }],
  };
  console.log(categoryDetail);
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
        <h2 className="text-xl font-bold text-gray-800">카테고리 상세 분석</h2>
        <select 
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-auto"
          disabled={majorCategories.length === 0}
        >
          {majorCategories
            .filter(cat => cat.type === 'expense')
            .map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
        </select>
      </div>
      {isDetailLoading ? <div className="text-center py-10">상세 데이터 로딩 중...</div>
      : categoryDetail && categoryDetail.data.length > 0 ? (
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="w-48 h-48 flex-shrink-0">
            <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
          <div className="w-full flex-grow">
            <ul className="text-sm space-y-2 max-h-48 overflow-y-auto">
              {categoryDetail.data.sort((a, b) => b.totalSpent - a.totalSpent).map((item, index) => (
                <li key={item.subCategoryId} className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}></span>
                    <span className="truncate">{item.subCategoryName}</span>
                  </div>
                  <span className="font-semibold whitespace-nowrap">{item.totalSpent.toLocaleString()}원</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : <p className="py-10 text-center text-gray-500">선택된 카테고리의 지출 내역이 없습니다.</p>}
    </div>
  );
};


// --- 월간 리포트 메인 페이지 ---
export default function ReportPage() {
  const { financialTrend, topSpending, isLoading, loadReports } = useReportStore();
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
  });

  useEffect(() => {
    loadReports(dateRange);
  }, [dateRange, loadReports]);

  const isMultiMonth = dayjs(dateRange.endDate).diff(dayjs(dateRange.startDate), 'month') >= 1;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800 self-start md:self-center">
          월간 리포트
        </h1>
        <DateRangeSelector onSearch={(start, end) => setDateRange({ startDate: start, endDate: end })} />
      </div>

      {isLoading ? (
        <div className="text-center py-10">리포트 데이터를 불러오는 중...</div>
      ) : financialTrend ? (
        <div className="space-y-8">
          <FinancialTrendSummary data={financialTrend.data} />
          {isMultiMonth && <MonthlyExpenseChart breakdown={financialTrend.data.categoryBreakdown} />}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {topSpending && <TopSpendingSection data={topSpending.data} />}
            <CategoryDetailSection dateRange={dateRange} />
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl shadow-lg">
          <p className="text-lg text-gray-500">해당 기간의 리포트 데이터가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

