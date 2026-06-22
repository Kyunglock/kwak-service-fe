import { insightApiClient } from '@/app/utils/apiClient';
import type { ApiResponse, InsightResultResponse, InsightResultTypeCd } from '@/app/types';

const BASE_URL = '/api/v1/insights';

export const getAllInsightResults = () => {
  return insightApiClient.get<ApiResponse<InsightResultResponse[]>>(`${BASE_URL}/results`);
};

export const getInsightResultByType = (resultTypeCd: InsightResultTypeCd) => {
  return insightApiClient.get<ApiResponse<InsightResultResponse | null>>(`${BASE_URL}/results/${resultTypeCd}`);
};

export const buildInsightContext = () => {
  return insightApiClient.post<ApiResponse<InsightResultResponse[]>>(`${BASE_URL}/build-context`);
};
