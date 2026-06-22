import apiClient from '@/app/utils/apiClient';

const BASE_URL = '/api/v1/sectors';

// 포트폴리오별 섹터 비중 요약 조회
export const getSectorSummary = (portfolioId: number) => {
  return apiClient.get(`${BASE_URL}/portfolio/${portfolioId}/summary`);
};

// 포트폴리오별 섹터 비중 목록 조회
export const getSectorsByPortfolio = (portfolioId: number) => {
  return apiClient.get(`${BASE_URL}/portfolio/${portfolioId}`);
};
