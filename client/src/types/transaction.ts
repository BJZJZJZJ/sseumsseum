/**
 * 거래 내역 데이터의 형태 (API 응답 기준)
 */
export interface Transaction {
  id: string;
  amount: number;
  method: 'cash' | 'card' | string; // '현금', '카드' 외 다른 결제수단이 있을 수 있음
  type: 'income' | 'expense';
  description: string;
  date: string; // ISO 8601 형식의 날짜 문자열 (예: "2025-09-09T00:00:00.000Z")
  category: string;
}