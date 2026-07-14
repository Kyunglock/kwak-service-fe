import { useState, useEffect } from "react";
import { Newspaper } from "lucide-react";
import { Card } from "@/app/components/ui/layout/card";
import { Badge } from "@/app/components/ui/feedback/badge";
import { getMarketBriefing } from "@/app/services/newsService";
import type { MarketBriefingResponse } from "@/app/types";

/**
 * 종목 탭 상단 시황 브리핑 카드 — AI 요약만 표시 (기사 목록 없음, 사용자 결정).
 * 데이터 없음/API 실패 시 아무것도 렌더링하지 않는다 — 포트폴리오 화면 방해 금지.
 * (API는 articles를 계속 내려주지만 이 카드는 사용하지 않는다)
 */
export function MarketBriefingCard() {
  const [briefing, setBriefing] = useState<MarketBriefingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMarketBriefing()
      .then((res) => {
        if (!cancelled) setBriefing(res.data.data ?? null);
      })
      .catch(() => {
        // 실패 시 카드 미표시 — 무간섭 클라이언트라 전역 토스트/리다이렉트도 없다
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Card className="p-4 bg-slate-700 border-slate-600 animate-pulse">
        <div className="h-4 bg-slate-600 rounded w-1/3 mb-3"></div>
        <div className="h-3 bg-slate-600 rounded w-full mb-1"></div>
        <div className="h-3 bg-slate-600 rounded w-5/6"></div>
      </Card>
    );
  }

  if (!briefing) return null;

  return (
    <Card className="overflow-hidden bg-slate-700 border-slate-600">
      {/* 그라데이션 헤더 */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-blue-600/25 via-indigo-600/15 to-transparent border-b border-slate-600/60">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/20">
            <Newspaper className="w-4 h-4 text-blue-400" />
          </span>
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-gray-100">오늘의 미국 증시</h2>
            <span className="text-[10px] font-medium text-blue-400/80 tracking-wide">AI 요약</span>
          </div>
        </div>
        <Badge variant="outline" className="text-[11px] border-slate-500/60 bg-slate-800/40 text-gray-400">
          {briefing.summaryDt}
        </Badge>
      </div>

      {/* AI 요약 — 전체 표시 */}
      <p className="px-4 py-3 text-[13px] text-gray-300 leading-relaxed whitespace-pre-line">
        {briefing.summary}
      </p>
    </Card>
  );
}
