import apiClient from '@/app/utils/apiClient';
import type {
  PortfolioItemAddRequest,
  PortfolioItemModRequest,
  PortfolioItemSearchRequest,
} from '@/app/types';

const BASE_URL = '/api/v1/portfolio-items';

// 종목 단건 조회
export const getPortfolioItem = (itemId: number) => {
  return apiClient.get(`${BASE_URL}/${itemId}`);
};

// 포트폴리오별 종목 목록 조회
export const getPortfolioItems = (portfolioId: number) => {
  return apiClient.get(`${BASE_URL}/portfolio/${portfolioId}`);
};

// 종목 검색
export const searchPortfolioItems = (params: PortfolioItemSearchRequest) => {
  return apiClient.get(BASE_URL, { params });
};

// 종목 등록 (매수)
export const addPortfolioItem = (data: PortfolioItemAddRequest) => {
  return apiClient.post(BASE_URL, data);
};

// 종목 수정 (일부 매도)
export const modifyPortfolioItem = (data: PortfolioItemModRequest) => {
  return apiClient.put(BASE_URL, data);
};

// 종목 삭제 (전량 매도)
export const removePortfolioItem = (itemId: number) => {
  return apiClient.delete(`${BASE_URL}/${itemId}`);
};
