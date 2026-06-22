import { guruApiClient as apiClient } from '@/app/utils/apiClient';
import type { ApiResponse, PageResponse, GuruPortfolioResponse, GuruActivityResponse, GuruLatestActivityResponse } from '@/app/types';

const PORTFOLIO_URL = '/api/v1/guru/portfolios';
const ACTIVITY_URL = '/api/v1/guru/activities';

export type { GuruPortfolioResponse, GuruActivityResponse, GuruLatestActivityResponse };

interface GuruPortfolioSearchParams {
  page?: number;
  investorNm?: string;
  ticker?: string;
  reportDate?: string;
  activityYear?: number;
  activityQtr?: number;
}

/** 현재 날짜 기준으로 직전 분기 반환 */
export function getPrevQuarter(): { activityYear: number; activityQtr: number } {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();
  const currentQtr = Math.ceil(month / 3); // 1-4
  if (currentQtr === 1) return { activityYear: year - 1, activityQtr: 4 };
  return { activityYear: year, activityQtr: currentQtr - 1 };
}

export const getGuruPortfolios = (params: GuruPortfolioSearchParams = {}) => {
  const { page = 1, ...rest } = params;
  return apiClient.get<ApiResponse<PageResponse<GuruPortfolioResponse> | GuruPortfolioResponse[]>>(
    PORTFOLIO_URL,
    { params: { page, ...rest } }
  );
};

export const getGuruActivities = () =>
  apiClient.get<ApiResponse<PageResponse<GuruActivityResponse>>>(ACTIVITY_URL);

export const getGuruLatestActivities = () =>
  apiClient.get<ApiResponse<GuruLatestActivityResponse[]>>(`${PORTFOLIO_URL}/latest-activities`);
