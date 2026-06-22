import apiClient from '@/app/utils/apiClient';

const BASE_URL = '/api/v1/dividends';

// 포트폴리오별 예상 배당금 요약 조회
export const getDividendSummary = (portfolioId: number) => {
  return apiClient.get(`${BASE_URL}/portfolio/${portfolioId}/summary`);
};

// 포트폴리오별 종목별 배당금 목록 조회
export const getDividendsByPortfolio = (portfolioId: number) => {
  return apiClient.get(`${BASE_URL}/portfolio/${portfolioId}`);
};
