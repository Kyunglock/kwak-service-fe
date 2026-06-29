import { Target, TrendingUp, RefreshCw } from "lucide-react";
import { Card } from "@/app/components/ui/layout/card";
import type { InsightResultResponse, ProfileFitContent } from "@/app/types";

interface Props {
  insightResult: InsightResultResponse | null;
  building?: boolean;
}

const LEVEL_STYLE: Record<string, string> = {
  높음: "bg-emerald-900/40 border-emerald-600/50 text-emerald-300",
  보통: "bg-blue-900/40 border-blue-600/50 text-blue-300",
  낮음: "bg-red-900/40 border-red-600/50 text-red-300",
};

function parseContent(content: string | undefined): ProfileFitContent | null {
  if (!content) return null;
  try {
    const obj = JSON.parse(content) as ProfileFitContent;
    if (!Array.isArray(obj.fit) || !Array.isArray(obj.rebalance)) return null;
    return obj;
  } catch {
    return null;
  }
}

export function ProfileFitCard({ insightResult, building }: Props) {
  const parsed = parseContent(insightResult?.content);

  return (
    <Card className="p-0 gap-0 bg-slate-700 border-slate-600 overflow-hidden">
      <div className="h-1 bg-teal-500 opacity-70" />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-100">
            <Target className="w-4 h-4 text-teal-400" />
            성향 적합도
          </h3>
          {building && (
            <span className="flex items-center gap-1.5 text-xs text-teal-300">
              <RefreshCw className="w-3 h-3 animate-spin" />
              분석 중...
            </span>
          )}
        </div>

        {!parsed ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
            <span className="text-3xl">🎯</span>
            <p className="text-sm text-gray-300 font-medium">성향 적합도 분석 전</p>
            <p className="text-xs text-gray-400">
              설문을 완료하고 결과를 생성하면
              <br />내 종목이 투자 성향에 맞는지 분석해 드립니다.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 종목별 적합도 */}
            <div>
              <p className="text-[11px] font-semibold text-gray-400 mb-2">종목별 성향 적합도</p>
              <div className="space-y-1.5">
                {parsed.fit.length === 0 ? (
                  <p className="text-[11px] text-gray-500">분석할 보유 종목이 없습니다.</p>
                ) : (
                  parsed.fit.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-600/40">
                      <span
                        className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded border ${
                          LEVEL_STYLE[f.level] ?? "bg-slate-600 border-slate-500 text-gray-300"
                        }`}
                      >
                        {f.level}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium text-gray-100">{f.ticker}</p>
                        <p className="text-[11px] text-gray-400 leading-relaxed">{f.reason}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 리밸런싱 제안 */}
            <div>
              <p className="text-[11px] font-semibold text-gray-400 mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                맞춤 리밸런싱 제안
              </p>
              <div className="space-y-1.5">
                {parsed.rebalance.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[10px] text-teal-400 font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                    <p className="text-[11px] text-gray-300 leading-relaxed">{r}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-gray-500 pt-1">AI 분석 · 설문 성향 + 보유 종목 기반</p>
          </div>
        )}
      </div>
    </Card>
  );
}
