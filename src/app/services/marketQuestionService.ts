import { insightApiClient } from "@/app/utils/apiClient";
import type { ApiResponse, MarketQuestionResponse } from "@/app/types";

const BASE_URL = "/api/v1/qa";

/**
 * 시황 질문 답변 요청. 의도추출 + 서술 LLM 호출 2회에 최대 60초 온디맨드
 * 크롤링까지 들어갈 수 있어, insightApiClient(120초 타임아웃)를 쓴다 —
 * 기본 apiClient 는 이 정도로 오래 걸리는 호출을 상정하지 않는다.
 */
export const askMarketQuestion = (text: string) => {
  return insightApiClient.post<ApiResponse<MarketQuestionResponse>>(`${BASE_URL}/ask`, {
    text,
  });
};
