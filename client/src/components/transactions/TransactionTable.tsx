import type { Transaction } from '../../types/transaction';
import { Edit, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

export default function TransactionTable({ transactions, onEdit, onDelete }: TransactionTableProps) {
  // 데이터가 없을 때의 UI
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-white shadow-md rounded-lg">
        <p className="text-gray-500">거래 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    // 데스크탑에서는 테이블, 모바일에서는 block 컨테이너
    <div className="md:bg-white md:shadow-md md:rounded-lg md:overflow-hidden">
      {/* 데스크탑용 테이블 헤더 (모바일에선 숨김) */}
      <table className="min-w-full hidden md:table">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">내용</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">수정/삭제</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 tabular-nums">
                {dayjs(transaction.date).format('YYYY-MM-DD')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.category}</td>
              <td className="px-6 py-4 text-sm text-gray-900 break-all">{transaction.description}</td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${transaction.type === 'income' ? 'text-blue-600' : 'text-red-600'}`}>
                {transaction.type === 'income' ? '+' : '-'}
                {transaction.amount.toLocaleString()}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button onClick={() => onEdit(transaction)} className="text-indigo-600 hover:text-indigo-900"><Edit className="h-5 w-5" /></button>
                  <button onClick={() => onDelete(transaction.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-5 w-5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 모바일용 카드 리스트 (데스크탑에선 숨김) */}
      <div className="md:hidden space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="bg-white shadow-md rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">{dayjs(transaction.date).format('YYYY-MM-DD')}</p>
                <p className="font-bold text-lg">{transaction.description}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => onEdit(transaction)} className="text-indigo-600"><Edit className="h-5 w-5" /></button>
                <button onClick={() => onDelete(transaction.id)} className="text-red-600"><Trash2 className="h-5 w-5" /></button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full">{transaction.category}</span>
              <p className={`text-lg font-bold ${transaction.type === 'income' ? 'text-blue-600' : 'text-red-600'}`}>
                {transaction.type === 'income' ? '+' : '-'}
                {transaction.amount.toLocaleString()}원
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}