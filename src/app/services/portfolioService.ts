import apiClient from '@/app/utils/apiClient';
import type {
  PortfolioAddRequest,
  PortfolioModRequest,
} from '@/app/types';

const BASE_URL = '/api/v1/portfolios';

// 포트폴리오 단건 조회
export const getPortfolio = (portfolioId: number) => {
  return apiClient.get(`${BASE_URL}/${portfolioId}`);
};

// 사용자별 포트폴리오 목록 조회
export const getPortfoliosByUser = () => {
  return apiClient.get(`${BASE_URL}`);
};

// 포트폴리오 등록
export const addPortfolio = (data: PortfolioAddRequest) => {
  return apiClient.post(BASE_URL, data);
};

// 포트폴리오 수정
export const modifyPortfolio = (data: PortfolioModRequest) => {
  return apiClient.put(BASE_URL, data);
};

// 포트폴리오 삭제 (논리삭제 USE_YN = 'N')
export const removePortfolio = (portfolioId: number) => {
  return apiClient.delete(`${BASE_URL}/${portfolioId}`);
};
