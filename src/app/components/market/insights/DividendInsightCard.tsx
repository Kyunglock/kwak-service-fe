import { Coins, RefreshCw } from "lucide-react";
import { Card } from "@/app/components/ui/layout/card";
import { useCurrency } from "@/app/contexts/CurrencyContext";
import type { InsightResultResponse, DividendInsightContent } from "@/app/types";

interface Props {
  insightResult: InsightResultResponse | null;
  building?: boolean;
}

function parseContent(content: string | undefined): DividendInsightContent | null {
  if (!content) return null;
  try {
    const obj = JSON.parse(content) as DividendInsightContent;
    if (
      typeof obj.summary !== "string" ||
      typeof obj.annualDividendUsd !== "number" ||
      typeof obj.annualDividendKrw !== "number" ||
      typeof obj.portfolioYield !== "number" ||
      typeof obj.dividendStockWeight !== "number" ||
      !Array.isArray(obj.monthlyFlow) ||
      !Array.isArray(obj.findings)
    )
      return null;
    return obj;
  } catch {
    return null;
  }
}

export function DividendInsightCard({ insightResult, building }: Props) {
  const parsed = parseContent(insightResult?.content);
  const { convert, currency } = useCurrency();

  // ₩환산 월별 예상 배당금을 표시 통화로 변환해 막대 라벨용으로 축약 표기
  const fmtMonthAmt = (krwEquiv: number): string => {
    const v = convert(krwEquiv, "KRW");
    if (currency === "KRW") {
      if (v >= 10_000) return `${(v / 10_000).toFixed(v >= 100_000 ? 0 : 1)}만`;
      if (v >= 1_000) return `${(v / 1_000).toFixed(1)}천`;
      return `${Math.round(v)}`;
    }
    if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}k`;
    return v >= 100 ? `$${Math.round(v)}` : `$${v.toFixed(1)}`;
  };

  // 연 예상 배당 — USD+KRW 합산을 표시 통화 단일 값으로
  const annualTotal = parsed
    ? convert(parsed.annualDividendUsd, "USD") + convert(parsed.annualDividendKrw, "KRW")
    : 0;
  const fmtAnnualTotal =
    currency === "KRW"
      ? `₩${Math.round(annualTotal).toLocaleString("ko-KR")}`
      : `$${annualTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const maxAmt = Math.max(...(parsed?.monthlyAmountsKrw ?? [0]), 0);

  return (
    <Card className="p-0 gap-0 bg-slate-700 border-slate-600 overflow-hidden">
      <div className="h-1 bg-amber-500 opacity-70" />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-100">
            <Coins className="w-4 h-4 text-amber-400" />
            배당 인사이트
          </h3>
          {building && (
            <span className="flex items-center gap-1.5 text-xs text-amber-300">
              <RefreshCw className="w-3 h-3 animate-spin" />
              분석 중...
            </span>
          )}
        </div>

        {!parsed ? (
          building ? (
            <div className="space-y-3 py-2 animate-pulse">
              <div className="h-3 bg-slate-600/60 rounded w-4/5" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-12 bg-slate-600/40 rounded-lg" />
                <div className="h-12 bg-slate-600/40 rounded-lg" />
                <div className="h-12 bg-slate-600/40 rounded-lg" />
              </div>
              <div className="h-28 bg-slate-600/30 rounded-lg" />
              <div className="h-3 bg-slate-600/50 rounded w-2/3" />
            </div>
          ) : (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
            <span className="text-3xl">💰</span>
            <p className="text-sm text-gray-300 font-medium">배당 분석 전</p>
            <p className="text-xs text-gray-400">
              결과를 생성하면 배당 현금흐름과
              <br />투자 성향의 궁합을 분석해 드립니다.
            </p>
          </div>
          )
        ) : (
          <div className={`space-y-4 ${building ? "opacity-50" : ""}`}>
            {/* 총평 */}
            <p className="text-[12px] text-gray-200 leading-relaxed">{parsed.summary}</p>

            {/* 3개 스탯 */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-slate-600/40 p-2 text-center">
                <p className="text-[10px] text-gray-400 mb-0.5">연 예상 배당</p>
                <p className="text-[12px] font-bold text-gray-100">{fmtAnnualTotal}</p>
              </div>
              <div className="rounded-lg bg-slate-600/40 p-2 text-center">
                <p className="text-[10px] text-gray-400 mb-0.5">배당수익률</p>
                <p className="text-[12px] font-bold text-amber-300">{parsed.portfolioYield.toFixed(2)}%</p>
              </div>
              <div className="rounded-lg bg-slate-600/40 p-2 text-center">
                <p className="text-[10px] text-gray-400 mb-0.5">배당주 비중</p>
                <p className="text-[12px] font-bold text-gray-100">{parsed.dividendStockWeight.toFixed(0)}%</p>
                <p className="text-[9px] text-gray-500 mt-0.5">수익률 2%+ 기준</p>
              </div>
            </div>

            {/* 월별 예상 배당금 — 1~12월 막대 그래프 (금액 라벨) */}
            <div>
              <p className="text-[11px] font-semibold text-gray-400 mb-1.5">월별 예상 배당금</p>
              <div className="flex items-end gap-1 h-52">
                {parsed.monthlyFlow.slice(0, 12).map((v, i) => {
                  const amt = parsed.monthlyAmountsKrw?.[i] ?? 0;
                  const paying = v > 0;
                  const barH = paying
                    ? maxAmt > 0
                      ? Math.max((amt / maxAmt) * 150, 24)
                      : 90
                    : 4;
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0"
                      title={paying ? `${i + 1}월 예상 배당 ${fmtMonthAmt(amt)}` : `${i + 1}월: 배당 없음`}
                    >
                      {paying && amt > 0 && (
                        <span className="text-[11px] font-bold text-amber-300 whitespace-nowrap">
                          {fmtMonthAmt(amt)}
                        </span>
                      )}
                      <div
                        className={`w-full rounded-t ${paying ? "bg-amber-400" : "bg-slate-600"}`}
                        style={{ height: `${barH}px` }}
                      />
                      <span className="text-[10px] text-gray-500">{i + 1}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                최근 1년 배당 이력 기준 예상 금액입니다.
              </p>
            </div>

            {/* 성향 대조 */}
            {parsed.profileContrast && (
              <p className="text-[11px] text-gray-300 leading-relaxed bg-slate-600/30 rounded-lg p-2.5">
                {parsed.profileContrast}
              </p>
            )}

            {/* 발견사항 */}
            {parsed.findings.length > 0 && (
              <ul className="space-y-1">
                {parsed.findings.map((f, i) => (
                  <li key={i} className="text-[11px] text-gray-400 flex gap-1.5">
                    <span className="text-amber-400 flex-shrink-0">•</span>
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
