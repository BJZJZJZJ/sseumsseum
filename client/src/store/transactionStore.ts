import { create } from 'zustand';
import { fetchTransactions, createTransaction, updateTransaction, deleteTransaction } from '../api/transactionApi';
import type { Transaction } from '../types/transaction';
import type { PaginationInfo, CreateTransactionRequest } from '../types/api';
import dayjs from 'dayjs';

interface TransactionState {
  transactions: Transaction[];
  pagination: PaginationInfo | null;
  currentMonth: string;
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  setCurrentMonth: (month: string) => void;
  loadTransactions: (isReload?: boolean) => Promise<void>; // isReload 파라미터 추가
  addTransaction: (data: CreateTransactionRequest) => Promise<void>;
  updateTransaction: (id: string, data: CreateTransactionRequest) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  pagination: null,
  currentMonth: dayjs().format('YYYY-MM'),
  isLoading: false,
  isFetchingMore: false,
  hasMore: true,
  error: null,

  setCurrentMonth: (month) => {
    set({ currentMonth: month, transactions: [], pagination: null, hasMore: true });
  },

  loadTransactions: async (isReload = false) => {
    const { currentMonth, pagination, isLoading, isFetchingMore, hasMore, transactions } = get();

    if (isLoading || isFetchingMore) return;
    if (!isReload && !hasMore) return;

    const pageToFetch = isReload ? 1 : (pagination ? pagination.currentPage + 1 : 1);
    
    if (pageToFetch === 1) {
      set({ isLoading: true });
    } else {
      set({ isFetchingMore: true });
    }
    set({ error: null });

    const startDate = dayjs(currentMonth).startOf('month').format('YYYY-MM-DD');
    const endDate = dayjs(currentMonth).endOf('month').format('YYYY-MM-DD');

    try {
      const response = await fetchTransactions({ page: pageToFetch, limit: 20, startDate, endDate });
      set({
        transactions: pageToFetch === 1 ? response.data : [...transactions, ...response.data],
        pagination: response.pagination,
        hasMore: response.pagination.currentPage < response.pagination.totalPages,
      });
    } catch (err) {
      set({ error: '거래내역을 불러오는 데 실패했습니다.' });
    } finally {
      set({ isLoading: false, isFetchingMore: false });
    }
  },

  addTransaction: async (data) => {
    try {
      await createTransaction(data);
      await get().loadTransactions(true); // 처음부터 다시 로드
    } catch (err) { console.error("거래내역 추가 실패:", err); throw err; }
  },
  updateTransaction: async (id, data) => {
    try {
      await updateTransaction(id, data);
      await get().loadTransactions(true); // 처음부터 다시 로드
    } catch (err) { console.error("거래내역 수정 실패:", err); throw err; }
  },
  deleteTransaction: async (id) => {
    try {
      await deleteTransaction(id);
      await get().loadTransactions(true); // 처음부터 다시 로드
    } catch (err) { console.error("거래내역 삭제 실패:", err); throw err; }
  },
}));

export default useTransactionStore;

