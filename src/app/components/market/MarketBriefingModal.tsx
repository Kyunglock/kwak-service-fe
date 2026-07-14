import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, X } from "lucide-react";
import { getMarketBriefing } from "@/app/services/newsService";
import type { MarketBriefingResponse, MarketSentiment } from "@/app/types";

// 키 이름 변경 이력: marketBriefingSeenDt → Dismissed — 구버전에선 일반 닫기도 기록했어서
// 의미가 달라진 새 버전('다시 보지 않기'만 기록)에서 구 기록을 무효화하기 위해 키를 교체함
const SEEN_KEY = "marketBriefingDismissedDt";

// 감성별 테마 — 앱 관례(수익 green / 손실 red) 준수, 보합·미분류는 중립 슬레이트
const THEMES: Record<
  MarketSentiment | "UNKNOWN",
  { label: string; Icon: typeof TrendingUp; header: string; iconBox: string; iconColor: string; chip: string }
> = {
  POSITIVE: {
    label: "호재",
    Icon: TrendingUp,
    header: "bg-gradient-to-r from-green-600/30 via-emerald-600/15 to-transparent border-green-700/50",
    iconBox: "bg-green-500/20",
    iconColor: "text-green-400",
    chip: "bg-green-950 text-green-400 border border-green-800",
  },
  NEGATIVE: {
    label: "악재",
    Icon: TrendingDown,
    header: "bg-gradient-to-r from-red-600/30 via-rose-600/15 to-transparent border-red-700/50",
    iconBox: "bg-red-500/20",
    iconColor: "text-red-400",
    chip: "bg-red-950 text-red-400 border border-red-800",
  },
  NEUTRAL: {
    label: "보합",
    Icon: Minus,
    header: "bg-gradient-to-r from-slate-500/30 via-slate-500/15 to-transparent border-slate-500/50",
    iconBox: "bg-slate-400/20",
    iconColor: "text-gray-300",
    chip: "bg-slate-800 text-gray-300 border border-slate-600",
  },
  UNKNOWN: {
    label: "시황",
    Icon: Minus,
    header: "bg-gradient-to-r from-blue-600/25 via-indigo-600/15 to-transparent border-slate-600/60",
    iconBox: "bg-blue-500/20",
    iconColor: "text-blue-400",
    chip: "bg-slate-800 text-gray-300 border border-slate-600",
  },
};

/**
 * 종목 탭 진입 시 자동으로 뜨는 시황 브리핑 모달.
 * 일반 닫기(X·배경·확인)는 다음 진입 시 다시 뜨고, "다시 보지 않기"를 눌러야
 * 해당 summaryDt가 숨겨진다(localStorage — 다음날 새 요약은 다시 표시).
 * 데이터 없음/API 실패 시 아무것도 안 뜬다. 호재/악재/보합에 따라 색이 달라진다.
 */
export function MarketBriefingModal() {
  const [briefing, setBriefing] = useState<MarketBriefingResponse | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMarketBriefing()
      .then((res) => {
        if (cancelled) return;
        const data: MarketBriefingResponse | null = res.data.data ?? null;
        if (data && localStorage.getItem(SEEN_KEY) !== data.summaryDt) {
          setBriefing(data);
          setOpen(true);
        }
      })
      .catch(() => {
        // 실패 시 모달 미표시 — 무간섭 클라이언트라 전역 토스트/리다이렉트도 없다
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!open || !briefing) return null;

  const theme = THEMES[briefing.sentiment ?? "UNKNOWN"];
  const { Icon } = theme;

  const close = () => setOpen(false);

  const dismissForToday = () => {
    localStorage.setItem(SEEN_KEY, briefing.summaryDt);
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={close}
    >
      <div
        className="w-full max-w-2xl rounded-xl overflow-hidden bg-slate-700 border border-slate-600 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 감성 컬러 헤더 */}
        <div className={`flex items-center justify-between px-5 py-3.5 border-b ${theme.header}`}>
          <div className="flex items-center gap-3">
            <span className={`flex items-center justify-center w-9 h-9 rounded-lg ${theme.iconBox}`}>
              <Icon className={`w-5 h-5 ${theme.iconColor}`} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-100">오늘의 미국 증시</h2>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${theme.chip}`}>
                  {theme.label}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">{briefing.summaryDt} · AI 요약</p>
            </div>
          </div>
          <button
            onClick={close}
            aria-label="닫기"
            className="p-1 rounded text-gray-400 hover:text-gray-200 hover:bg-slate-600/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI 요약 */}
        <p className="px-6 py-5 text-[15px] text-gray-200 leading-relaxed whitespace-pre-line">
          {briefing.summary}
        </p>

        <div className="px-6 pb-5 flex items-center justify-between">
          <button
            onClick={dismissForToday}
            className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2 transition-colors"
          >
            다시 보지 않기
          </button>
          <button
            onClick={close}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-slate-600 text-gray-200 hover:bg-slate-500 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
