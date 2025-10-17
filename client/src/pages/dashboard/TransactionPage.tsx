import { useState, useEffect, useMemo, useRef, useCallback, forwardRef } from 'react';
import { Plus, Upload, MoreVertical, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import useTransactionStore from '../../store/transactionStore';
import dayjs from 'dayjs';

import TransactionModal from '../../components/transactions/TransactionModal';
import TransactionUploadModal from '../../components/transactions/TransactionUploadModal';
import MonthSelector from '../../components/transactions/MonthSelector';
import type { Transaction } from '../../types/transaction';

type ModalFormValues = {
  date: string;
  type: 'income' | 'expense';
  majorCategoryId: string;
  minorCategoryId: string;
  description: string;
  amount: number;
};

// --- 내부 컴포넌트들 ---

const SummaryCard = ({ title, amount, icon, color }: { title: string, amount: number, icon: React.ReactNode, color: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{amount.toLocaleString()}원</p>
    </div>
  </div>
);

const TransactionItem = forwardRef<HTMLLIElement, { transaction: Transaction, onEdit: (t: Transaction) => void, onDelete: (id: string) => void }>(
  ({ transaction, onEdit, onDelete }, ref) => {
    const isIncome = transaction.type === 'income';

    return (
      <li ref={ref} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
        <span className={`block w-3 h-3 rounded-full flex-shrink-0 ${isIncome ? 'bg-blue-500' : 'bg-red-500'}`}></span>
        
        <div className="flex-grow grid grid-cols-2 md:grid-cols-4 items-center gap-4">
          <div className="md:col-span-2">
            <p className="font-semibold text-gray-800 truncate">{transaction.description}</p>
            <p className="text-sm text-gray-500">{dayjs(transaction.date).format('YYYY.MM.DD')} ・ {transaction.category}</p>
          </div>
          <div className={`text-lg font-bold text-right whitespace-nowrap ${isIncome ? 'text-blue-600' : 'text-red-600'}`}>
            {isIncome ? '+' : '-'} {transaction.amount.toLocaleString()}원
          </div>
          <div className="hidden md:flex justify-end">
            <button onClick={() => onEdit(transaction)} className="p-2 text-sm text-gray-500 hover:text-indigo-600">수정</button>
            <button onClick={() => onDelete(transaction.id)} className="p-2 text-sm text-gray-500 hover:text-red-600">삭제</button>
          </div>
        </div>
         <div className="md:hidden">
            <MoreVertical size={20} className="text-gray-400" />
          </div>
      </li>
    );
  }
);
TransactionItem.displayName = 'TransactionItem';


// --- 메인 페이지 컴포넌트 ---
export default function TransactionPage() {
  const { 
    transactions, currentMonth, isLoading, isFetchingMore, hasMore, 
    setCurrentMonth, loadTransactions, addTransaction, updateTransaction, deleteTransaction 
  } = useTransactionStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    loadTransactions(true);
  }, [currentMonth, loadTransactions]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastTransactionElementRef = useCallback((node: HTMLLIElement | null) => {
    if (isLoading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadTransactions();
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, isFetchingMore, hasMore, loadTransactions]);


  const { totalIncome, totalExpense } = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.type === 'income') acc.totalIncome += t.amount;
      else acc.totalExpense += t.amount;
      return acc;
    }, { totalIncome: 0, totalExpense: 0 });
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter(t => t.type === filter);
  }, [transactions, filter]);
  
  const handleUpload = () => setIsUploadModalOpen(true);
  const handleUploadSuccess = () => loadTransactions(true);
  const handleAddNew = () => { setEditingTransaction(null); setIsModalOpen(true); };
  const handleEdit = (transaction: Transaction) => { setEditingTransaction(transaction); setIsModalOpen(true); };
  const handleDelete = async (id: string) => { if (window.confirm('정말로 이 거래 내역을 삭제하시겠습니까?')) { await deleteTransaction(id); }};
  
  const handleFormSubmit = async (formData: ModalFormValues) => {
    // ✅ [핵심 수정] 소분류 ID가 없으면 대분류 ID를 사용하도록 변경
    const apiData = {
      categoryId: formData.minorCategoryId || formData.majorCategoryId,
      description: formData.description,
      amount: formData.amount,
      type: formData.type,
      transactionDate: formData.date,
      method: 'card', // TODO: 결제 수단도 모달에서 받도록 수정 필요
    };

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, apiData);
      } else {
        await addTransaction(apiData);
      }
      setIsModalOpen(false);
      setEditingTransaction(null);
    } catch (error) {
      alert(`거래내역 ${editingTransaction ? '수정' : '추가'}에 실패했습니다.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">거래 내역</h1>
        <MonthSelector currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="총 수입" amount={totalIncome} icon={<TrendingUp size={24} className="text-blue-600"/>} color="bg-blue-100" />
        <SummaryCard title="총 지출" amount={totalExpense} icon={<TrendingDown size={24} className="text-red-600"/>} color="bg-red-100" />
        <SummaryCard title="합계" amount={totalIncome - totalExpense} icon={<Wallet size={24} className="text-green-600"/>} color="bg-green-100" />
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>전체</button>
            <button onClick={() => setFilter('income')} className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${filter === 'income' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>수입</button>
            <button onClick={() => setFilter('expense')} className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${filter === 'expense' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>지출</button>
          </div>
          <div className="flex gap-2">
            <button onClick={handleUpload} className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"><Upload size={16}/><span>내역 업로드</span></button>
            <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"><Plus size={16}/><span>새 거래 추가</span></button>
          </div>
        </div>
        
        {isLoading ? <div className="text-center py-10">거래 내역을 불러오는 중...</div>
         : (
          <div>
            {filteredTransactions.length > 0 ? (
              <ul className="space-y-3">
                {filteredTransactions.map((t, index) => {
                  if (filteredTransactions.length === index + 1) {
                    return <TransactionItem ref={lastTransactionElementRef} key={t.id} transaction={t} onEdit={handleEdit} onDelete={handleDelete} />;
                  }
                  return <TransactionItem key={t.id} transaction={t} onEdit={handleEdit} onDelete={handleDelete} />;
                })}
              </ul>
            ) : <div className="text-center text-gray-500 py-10">표시할 거래 내역이 없습니다.</div>}

            {isFetchingMore && <div className="text-center py-4">더 많은 내역을 불러오는 중...</div>}
            {!hasMore && transactions.length > 0 && <div className="text-center py-4 text-sm text-gray-400">마지막 내역입니다.</div>}
          </div>
        )}
      </div>

      {isModalOpen && <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} transactionToEdit={editingTransaction} />}
      {isUploadModalOpen && <TransactionUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUploadSuccess={handleUploadSuccess} />}
    </div>
  );
}

