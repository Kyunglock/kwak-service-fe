import { insightApiClient } from '@/app/utils/apiClient';
import type { ApiResponse, FortuneResponse } from '@/app/types';

const BASE_URL = '/api/v1/fortunes';

/** 종목운세 조회 — 최초 요청 시 동기 LLM 생성이라 수십 초 걸릴 수 있음 (insightApiClient: 120s) */
export const getFortune = (ticker: string) => {
  return insightApiClient.get<ApiResponse<FortuneResponse>>(
    `${BASE_URL}/${encodeURIComponent(ticker)}`,
  );
};
