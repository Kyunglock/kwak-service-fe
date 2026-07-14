import { marketAnalysisClient } from '@/app/utils/apiClient';

// 시황 브리핑 — collector가 수집한 미국 증시 뉴스 + LLM 요약
export const getMarketBriefing = () =>
  marketAnalysisClient.get('/api/v1/news/market-briefing');
