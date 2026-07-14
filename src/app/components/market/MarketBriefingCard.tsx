import { useState, useEffect } from "react";
import { Newspaper, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Card } from "@/app/components/ui/layout/card";
import { Badge } from "@/app/components/ui/feedback/badge";
import { getMarketBriefing } from "@/app/services/newsService";
import type { MarketBriefingResponse } from "@/app/types";

/** "2026-07-14T05:12:00" → "07-14 05:12" */
function formatPublishedAt(iso: string): string {
  if (!iso || iso.length < 16) return iso ?? "";
  return `${iso.slice(5, 10)} ${iso.slice(11, 16)}`;
}

/**
 * 종목 탭 상단 시황 브리핑 카드.
 * AI 요약은 항상 표시, 기사 목록은 접이식(기본 접힘).
 * 데이터 없음/API 실패 시 아무것도 렌더링하지 않는다 — 포트폴리오 화면 방해 금지.
 */
export function MarketBriefingCard() {
  const [briefing, setBriefing] = useState<MarketBriefingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

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
    <Card className="p-4 bg-slate-700 border-slate-600">
      {/* 헤더: 제목 + 기준일 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-blue-400" />
          <h2 className="font-semibold text-gray-100">오늘의 미국 증시</h2>
        </div>
        <Badge variant="outline" className="text-xs border-slate-600 text-gray-300">
          {briefing.summaryDt}
        </Badge>
      </div>

      {/* AI 요약 — 항상 표시 */}
      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
        {briefing.summary}
      </p>

      {/* 기사 목록 — 접이식 */}
      {briefing.articles.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-gray-200 border-t border-slate-600 pt-2 transition-colors"
          >
            관련 기사 {briefing.articles.length}건 {expanded ? "접기" : "펼쳐보기"}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {expanded && (
            <ul className="mt-2 space-y-1">
              {briefing.articles.map((article, idx) => (
                <li key={`${article.url}-${idx}`}>
                  <a
                    // 외부 RSS 출처 URL — http(s) 외 스킴(javascript: 등)은 링크로 걸지 않는다
                    href={/^https?:\/\//.test(article.url) ? article.url : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 p-2 rounded hover:bg-slate-600/50 transition-colors group"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="flex-1 min-w-0">
                      <span className="block text-xs text-gray-200 leading-snug">
                        {article.title}
                      </span>
                      <span className="block text-[11px] text-gray-500 mt-0.5">
                        {article.source} · {formatPublishedAt(article.publishedAt)}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  );
}
