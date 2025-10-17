import axiosInstance from './axiosInstance';
import type { FetchTransactionsResponse, CreateTransactionRequest, CreateTransactionResponse, UploadTransactionsResponse } from '../types/api';

/**
 * 거래내역 조회를 위한 파라미터 타입
 */
export interface FetchTransactionsParams {
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
  // 필요에 따라 q, type 등 다른 파라미터도 추가 가능
}

/**
 * GET /api/v1/transactions/
 * 이용자의 거래 내역을 조회합니다.
 */
export const fetchTransactions = async (params: FetchTransactionsParams): Promise<FetchTransactionsResponse> => {
  const response = await axiosInstance.get<FetchTransactionsResponse>('/transactions/', {
    params,
  });
  return response.data;
};

/**
 * POST /api/v1/transactions/
 * 이용자의 거래내역을 생성합니다.
 */
export const createTransaction = async (data: CreateTransactionRequest): Promise<CreateTransactionResponse> => {
  const response = await axiosInstance.post<CreateTransactionResponse>('/transactions/', data);
  return response.data;
};
/**
 * PUT /api/v1/transactions/:id
 * 이용자의 거래내역을 수정합니다.
 */
export const updateTransaction = async (id: string, data: CreateTransactionRequest): Promise<CreateTransactionResponse> => {
  const response = await axiosInstance.put<CreateTransactionResponse>(`/transactions/${id}`, data);
  return response.data;
};

/**
 * DELETE /api/v1/transactions/:id
 * 이용자의 거래내역을 삭제합니다.
 */
export const deleteTransaction = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/transactions/${id}`);
};

/**
 * POST /api/v1/transactions/upload/
 * CSV 파일을 통해 거래 내역을 업로드합니다.
 */
export const uploadTransactions = async (file: File): Promise<UploadTransactionsResponse> => {
  const formData = new FormData();
  
  const newFile = new File([file], file.name, {
    type: 'text/csv',
  });
  
  formData.append('csvFile', newFile);

  const response = await axiosInstance.post<UploadTransactionsResponse>('/transactions/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};