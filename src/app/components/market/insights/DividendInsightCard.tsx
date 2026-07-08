import { Coins, RefreshCw } from "lucide-react";
import { Card } from "@/app/components/ui/layout/card";
import type { InsightResultResponse, DividendInsightContent } from "@/app/types";

interface Props {
  insightResult: InsightResultResponse | null;
  building?: boolean;
}

const MONTH_LABELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

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

function fmtAnnual(usd: number, krw: number): string {
  const parts: string[] = [];
  if (usd > 0) parts.push(`$${usd.toLocaleString("en-US", { maximumFractionDigits: 2 })}`);
  if (krw > 0) parts.push(`₩${Math.round(krw).toLocaleString("ko-KR")}`);
  return parts.length > 0 ? parts.join(" + ") : "-";
}

export function DividendInsightCard({ insightResult, building }: Props) {
  const parsed = parseContent(insightResult?.content);
  const maxFlow = parsed ? Math.max(...parsed.monthlyFlow, 1) : 1;

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
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
            <span className="text-3xl">💰</span>
            <p className="text-sm text-gray-300 font-medium">배당 분석 전</p>
            <p className="text-xs text-gray-400">
              결과를 생성하면 배당 현금흐름과
              <br />투자 성향의 궁합을 분석해 드립니다.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 총평 */}
            <p className="text-[12px] text-gray-200 leading-relaxed">{parsed.summary}</p>

            {/* 3개 스탯 */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-slate-600/40 p-2 text-center">
                <p className="text-[10px] text-gray-400 mb-0.5">연 예상 배당</p>
                <p className="text-[12px] font-bold text-gray-100">
                  {fmtAnnual(parsed.annualDividendUsd, parsed.annualDividendKrw)}
                </p>
              </div>
              <div className="rounded-lg bg-slate-600/40 p-2 text-center">
                <p className="text-[10px] text-gray-400 mb-0.5">배당수익률</p>
                <p className="text-[12px] font-bold text-amber-300">{parsed.portfolioYield.toFixed(2)}%</p>
              </div>
              <div className="rounded-lg bg-slate-600/40 p-2 text-center">
                <p className="text-[10px] text-gray-400 mb-0.5">배당주 비중</p>
                <p className="text-[12px] font-bold text-gray-100">{parsed.dividendStockWeight.toFixed(0)}%</p>
              </div>
            </div>

            {/* 월별 배당 흐름 */}
            <div>
              <p className="text-[11px] font-semibold text-gray-400 mb-1.5">월별 배당 흐름</p>
              <div className="flex items-end gap-1 h-10">
                {parsed.monthlyFlow.slice(0, 12).map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div
                      className={`w-full rounded-sm ${v > 0 ? "bg-amber-400/80" : "bg-slate-600"}`}
                      style={{ height: `${v > 0 ? Math.max((v / maxFlow) * 28, 6) : 3}px` }}
                    />
                    <span className="text-[9px] text-gray-500">{MONTH_LABELS[i]}</span>
                  </div>
                ))}
              </div>
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
