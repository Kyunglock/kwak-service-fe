import { stockAdvisorApiClient as apiClient } from '@/app/utils/apiClient';
import type { GuruPortfolioResponse, GuruActivityResponse, ApiResponse, PageResponse, RiskProfileItem, PreferredSectorItem, MarketRiskComparisonItem } from '@/app/types';

const PORTFOLIO_URL = '/api/v1/guru/portfolios';
const ACTIVITY_URL = '/api/v1/guru/activities';

// 구루 포트폴리오 목록 조회
export const getGuruPortfolios = (page = 1) => {
  return apiClient.get<ApiResponse<PageResponse<GuruPortfolioResponse> | GuruPortfolioResponse[]>>(PORTFOLIO_URL, { params: { page } });
};

// 구루 포트폴리오 단건 조회
export const getGuruPortfolio = (id: number) => {
  return apiClient.get<ApiResponse<GuruPortfolioResponse>>(`${PORTFOLIO_URL}/${id}`);
};

// 구루 매매 활동 목록 조회
export const getGuruActivities = () => {
  return apiClient.get<ApiResponse<PageResponse<GuruActivityResponse>>>(ACTIVITY_URL);
};

// 구루 매매 활동 단건 조회
export const getGuruActivity = (id: number) => {
  return apiClient.get<ApiResponse<GuruActivityResponse>>(`${ACTIVITY_URL}/${id}`);
};

// 사용자 투자 성향 설문 결과 조회
export const getRiskProfile = () => {
  return apiClient.get<ApiResponse<RiskProfileItem[]>>('/api/v1/users/risk-profile');
};

// 사용자 선호 섹터 조회
export const getPreferredSectors = () => {
  return apiClient.get<ApiResponse<PreferredSectorItem[]>>('/api/v1/users/preferred-sectors');
};

// 나 vs 전체 투자자 시장 리스크 설문 비교 조회
export const getMarketRiskComparison = () => {
  return apiClient.get<ApiResponse<MarketRiskComparisonItem[]>>('/api/v1/users/market-risk-comparison');
};
