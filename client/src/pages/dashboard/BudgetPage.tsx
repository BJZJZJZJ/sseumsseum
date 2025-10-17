import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import MonthSelector from '../../components/transactions/MonthSelector';
import useBudgetStore from '../../store/budgetStore';
import BudgetModal from '../../components/dashboard/BudgetModal';
import type { BudgetReportCategory, CreateBudgetRequest } from '../../types/api';
import dayjs from 'dayjs';

// --- 컴포넌트 분리 ---

const OverallSummary = ({ totalBudget, totalSpent }: { totalBudget: number, totalSpent: number }) => {
  const remaining = totalBudget - totalSpent;
  const progress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      <div className="flex justify-between items-center text-lg">
        <span className="font-bold">총 예산</span>
        <span className="font-bold">{totalBudget.toLocaleString()}원</span>
      </div>
      <div className="h-4 bg-gray-200 rounded-full">
        <div 
          className="h-4 bg-indigo-600 rounded-full transition-all duration-500" 
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-sm">
        <span>지출: {totalSpent.toLocaleString()}원</span>
        <span className={remaining >= 0 ? 'text-gray-600' : 'text-red-600'}>
          {remaining >= 0 ? `남음: ${remaining.toLocaleString()}원` : `초과: ${Math.abs(remaining).toLocaleString()}원`}
        </span>
      </div>
    </div>
  );
};

const BudgetCard = ({ reportItem }: { reportItem: BudgetReportCategory }) => {
  const { categoryName, totalBudget, totalSpent, remaining } = reportItem;
  const progress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  let progressBarColor = 'bg-blue-500';
  if (progress > 100) progressBarColor = 'bg-red-500';
  else if (progress > 80) progressBarColor = 'bg-yellow-500';

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">{categoryName}</h3>
      </div>
      <div className="h-2 bg-gray-200 rounded-full">
        <div 
          className={`h-2 ${progressBarColor} rounded-full transition-all duration-500`} 
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="text-sm space-y-1">
        <div className="flex justify-between"><span className="text-gray-500">지출</span><span>{totalSpent.toLocaleString()}원</span></div>
        <div className="flex justify-between"><span className="text-gray-500">예산</span><span>{totalBudget.toLocaleString()}원</span></div>
        <div className={`flex justify-between font-medium ${remaining < 0 ? 'text-red-600' : ''}`}>
          <span className="text-gray-500">남음</span><span>{remaining.toLocaleString()}원</span>
        </div>
      </div>
    </div>
  );
};

export default function BudgetPage() {
  const { budgetData, reportData, isLoading, loadBudgets, addBudget, updateBudget, deleteBudget } = useBudgetStore();
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'));
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadBudgets(currentMonth);
  }, [currentMonth, loadBudgets]);

  const handleBudgetSubmit = async (data: CreateBudgetRequest) => {
    try {
      const currentState = useBudgetStore.getState();
      
      const budgetForCurrentMonth = 
        currentState.budgetData && 
        currentState.budgetData.month &&
        dayjs(currentState.budgetData.month).format('YYYY-MM') === currentMonth
        ? currentState.budgetData
        : null;

      if (budgetForCurrentMonth) {
        await updateBudget(budgetForCurrentMonth.id, data);
      } else {
        await addBudget(data);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert('예산 설정에 실패했습니다.');
    }
  };
  
  const handleDeleteBudget = async () => {
    if (budgetData && window.confirm('정말로 이번 달 예산을 모두 삭제하시겠습니까?')) {
      try {
        await deleteBudget(budgetData.id);
      } catch (error) {
        alert('예산 삭제에 실패했습니다.');
      }
    }
  };

  const budgetForCurrentMonthExists = !!(budgetData && budgetData.month && dayjs(budgetData.month).format('YYYY-MM') === currentMonth);
  
  const totalBudgetedAmount = reportData?.data.reduce((sum, item) => sum + item.totalBudget, 0) || 0;
  const totalSpentAmount = reportData?.data.reduce((sum, item) => sum + item.totalSpent, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">월 예산 설정</h1>
        <div className="flex items-center gap-x-4">
          {budgetForCurrentMonthExists && (
            <button onClick={handleDeleteBudget} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" aria-label="예산 삭제">
              <Trash2 size={20} />
            </button>
          )}
          <MonthSelector currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">데이터를 불러오는 중...</div>
      ) : budgetForCurrentMonthExists && reportData ? (
        <>
          <OverallSummary totalBudget={totalBudgetedAmount} totalSpent={totalSpentAmount} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportData.data.map(item => (
              <BudgetCard key={item.categoryId} reportItem={item} />
            ))}
            <button onClick={() => setIsModalOpen(true)} className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:text-indigo-500 transition-colors">
              <Edit size={32} className="text-gray-400" />
              <span className="mt-2 font-medium">예산 수정</span>
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg shadow">
          <p className="text-lg text-gray-500">해당 월에 설정된 예산이 없습니다.</p>
          <button onClick={() => setIsModalOpen(true)} className="mt-4 flex items-center mx-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            <Plus size={20} className="mr-2" />
            첫 예산 설정하기
          </button>
        </div>
      )}

      {isModalOpen && (
        <BudgetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleBudgetSubmit}
          month={currentMonth}
          existingBudgetData={budgetData}
        />
      )}
    </div>
  );
}

