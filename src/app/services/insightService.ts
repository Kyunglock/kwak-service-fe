import { insightApiClient } from '@/app/utils/apiClient';
import type { ApiResponse, InsightResultResponse, InsightResultTypeCd, BuildStatus } from '@/app/types';

const BASE_URL = '/api/v1/insights';

export const getAllInsightResults = () => {
  return insightApiClient.get<ApiResponse<InsightResultResponse[]>>(`${BASE_URL}/results`);
};

export const getInsightResultByType = (resultTypeCd: InsightResultTypeCd) => {
  return insightApiClient.get<ApiResponse<InsightResultResponse | null>>(`${BASE_URL}/results/${resultTypeCd}`);
};

/** 비동기 빌드 트리거. 즉시 반환({status: PROCESSING|ALREADY_PROCESSING}). */
export const requestInsightBuild = () => {
  return insightApiClient.post<ApiResponse<{ status: string }>>(`${BASE_URL}/build-context`);
};

/** 빌드 상태 폴링용. */
export const getInsightBuildStatus = () => {
  return insightApiClient.get<ApiResponse<{ status: BuildStatus }>>(`${BASE_URL}/build-status`);
};
