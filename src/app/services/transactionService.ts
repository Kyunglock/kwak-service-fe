import apiClient from '@/app/utils/apiClient';
import type { TransactionAddRequest, TransactionModRequest } from '@/app/types';

const BASE_URL = '/api/v1/transactions';

// 거래 이력 단건 조회
export const getTransaction = (transId: number) => {
  return apiClient.get(`${BASE_URL}/${transId}`);
};

// 포트폴리오별 거래 이력 목록 조회
export const getTransactionsByPortfolio = (portfolioId: number) => {
  return apiClient.get(`${BASE_URL}/portfolio/${portfolioId}`);
};

// 거래 이력 등록 (매수/매도)
export const addTransaction = (data: TransactionAddRequest) => {
  return apiClient.post(BASE_URL, data);
};

// 거래 이력 수정
export const updateTransaction = (data: TransactionModRequest) => {
  return apiClient.put(`${BASE_URL}`, data);
};

// 거래 이력 삭제
export const removeTransaction = (transId: number) => {
  return apiClient.delete(`${BASE_URL}/${transId}`);
};
