import axios from "axios";

// 시황 브리핑은 보조 위젯 — 실패 시 카드만 조용히 미표시되어야 하므로
// 공용 인터셉터(404 → /error 리다이렉트, 5xx → 전역 토스트)가 없는 전용 클라이언트를 쓴다.
const silentClient = axios.create({
  baseURL: import.meta.env.VITE_MARKET_ANALYSIS_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// 시황 브리핑 — collector가 수집한 미국 증시 뉴스 + LLM 요약
export const getMarketBriefing = () => silentClient.get("/api/v1/news/market-briefing");
