import { Card } from "@/app/components/ui/layout/card";
import type { InsightResultResponse } from "@/app/types";

const FALLBACK_INSIGHTS = [
  "기술주에 대한 낙관적 전망이 지난주 대비 8% 증가했습니다.",
  "헬스케어 섹터 선호도가 12% 상승하며 방어적 투자 심리가 강화되었습니다.",
  "투자자의 47%가 중위험 성향으로 균형잡힌 포트폴리오를 선호합니다.",
  "인플레이션 완화를 투자 기회로 보는 비율이 58%에 달합니다.",
];

interface Props {
  insightResult: InsightResultResponse | null;
}

export function KeyInsightsCard({ insightResult }: Props) {
  const content = insightResult?.content ?? "";
  const lines = content ? content.split("\n").filter(Boolean) : [];

  // 실제 분석 결과는 bullet이 2개 이상 — 1줄이면 상태/안내 메시지로 간주
  const isStatusMessage = insightResult !== null && lines.length <= 1;

  const displayLines = !content || isStatusMessage ? FALLBACK_INSIGHTS : lines;

  return (
    <Card className="p-4 bg-gradient-to-br from-amber-900 to-orange-900 border-amber-700 text-white">
      <h3 className="font-semibold text-sm mb-3 flex items-center justify-between">
        <span>💡 주요 발견</span>
        {insightResult && !isStatusMessage && (
          <span className="text-[10px] font-normal opacity-60">AI 분석</span>
        )}
      </h3>

      {isStatusMessage ? (
        <div className="flex flex-col items-center justify-center py-3 gap-1.5 text-center">
          <p className="text-xs text-amber-200">{content}</p>
          <p className="text-[11px] text-amber-300 opacity-60">
            결과보기 버튼을 다시 눌러 분석을 갱신하세요.
          </p>
        </div>
      ) : (
        <ul className="space-y-2 text-xs">
          {displayLines.map((text, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="opacity-75 mt-0.5">•</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
