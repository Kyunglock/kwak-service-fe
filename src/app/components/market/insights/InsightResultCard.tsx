import { useState } from "react";
import { Brain, RefreshCw, AlertTriangle, Target, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/app/components/ui/layout/card";
import { Badge } from "@/app/components/ui/feedback/badge";
import { requestInsightBuild } from "@/app/services/insightService";
import type { InsightResultResponse, InsightResultTypeCd } from "@/app/types";

const RESULT_CARD_TYPES = ["RISK_ASSESSMENT", "PORTFOLIO_ALIGNMENT", "INVESTMENT_RECOMMENDATION"];

const TYPE_META: Record<
  string,
  {
    icon: string;
    Icon: React.ElementType;
    colorClass: string;
    borderClass: string;
    titleClass: string;
    badgeClass: string;
    label: string;
    subtitle: string;
    guide: { title: string; points: string[] };
  }
> = {
  RISK_ASSESSMENT: {
    icon: "⚠️",
    Icon: AlertTriangle,
    colorClass: "bg-orange-900/30",
    borderClass: "border-orange-700/40",
    titleClass: "text-orange-400",
    badgeClass: "bg-orange-700/60",
    label: "리스크 평가",
    subtitle: "포트폴리오의 위험 수준을 분석합니다",
    guide: {
      title: "리스크 관리 기준",
      points: [
        "단일 종목 비중 20% 초과 시 집중 리스크 주의",
        "섹터 편중이 40% 넘으면 하락 시 충격 확대",
        "현금 비중 10% 미만이면 기회 대응력 약화",
        "MDD(최대낙폭) 30% 이상은 심리적 손절 유발 위험",
      ],
    },
  },
  PORTFOLIO_ALIGNMENT: {
    icon: "🎯",
    Icon: Target,
    colorClass: "bg-purple-900/30",
    borderClass: "border-purple-700/40",
    titleClass: "text-purple-400",
    badgeClass: "bg-purple-700/60",
    label: "포트폴리오 정합성",
    subtitle: "투자 성향과 현재 구성의 일치도를 측정합니다",
    guide: {
      title: "정합성 개선 포인트",
      points: [
        "설문에서 나온 리스크 허용 범위와 실제 포트폴리오 변동성 비교",
        "목표 수익률 대비 현재 포트폴리오 기대 수익률 점검",
        "투자 기간과 자산 유동성 매칭 여부 확인",
        "방어주·성장주 비중이 성향과 균형을 이루는지 체크",
      ],
    },
  },
  INVESTMENT_RECOMMENDATION: {
    icon: "💡",
    Icon: Lightbulb,
    colorClass: "bg-blue-900/30",
    borderClass: "border-blue-700/40",
    titleClass: "text-blue-400",
    badgeClass: "bg-blue-700/60",
    label: "투자 추천",
    subtitle: "현재 성향과 시장 상황에 맞는 액션을 제시합니다",
    guide: {
      title: "추천 실행 체크리스트",
      points: [
        "추천 종목은 분할 매수로 진입해 평단 리스크 분산",
        "신규 진입 전 기존 포지션 수익·손실 현황 점검",
        "포트폴리오 전체 비중 변화가 10% 이내로 점진 조정",
        "추천 전략 실행 후 4주 뒤 성과 재평가 권장",
      ],
    },
  },
};

interface Props {
  results: InsightResultResponse[];
  onBuildComplete?: (all: InsightResultResponse[]) => void;
}

function InsightSection({ item }: { item: InsightResultResponse }) {
  const [expanded, setExpanded] = useState(true);
  const meta = TYPE_META[item.resultTypeCd];
  if (!meta) return null;

  const contentLines = item.content?.split("\n").filter((l) => l.trim()) ?? [];

  return (
    <div className={`rounded-xl border ${meta.colorClass} ${meta.borderClass} overflow-hidden`}>
      {/* 섹션 헤더 */}
      <button
        className="w-full flex items-center justify-between p-3 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{meta.icon}</span>
          <div>
            <p className={`text-xs font-bold ${meta.titleClass}`}>{meta.label}</p>
            <p className="text-[10px] text-gray-500">{meta.subtitle}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className={`w-4 h-4 flex-shrink-0 ${meta.titleClass}`} />
        ) : (
          <ChevronDown className={`w-4 h-4 flex-shrink-0 ${meta.titleClass}`} />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* AI 분석 내용 */}
          <div className="bg-black/20 rounded-lg p-3">
            <p className={`text-[10px] font-semibold mb-2 ${meta.titleClass}`}>🤖 AI 분석 결과</p>
            {contentLines.length > 0 ? (
              <ul className="space-y-1.5">
                {contentLines.map((line, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className={`mt-0.5 text-xs flex-shrink-0 ${meta.titleClass}`}>▸</span>
                    <p className="text-xs text-gray-200 leading-relaxed">{line}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{item.content}</p>
            )}
          </div>

          {/* 가이드 포인트 */}
          <div className="rounded-lg bg-black/10 border border-white/5 p-3">
            <p className={`text-[10px] font-semibold mb-2 ${meta.titleClass}`}>📌 {meta.guide.title}</p>
            <ul className="space-y-1.5">
              {meta.guide.points.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 text-[10px] text-gray-500 flex-shrink-0">{i + 1}.</span>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{point}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function InsightResultCard({ results }: Props) {
  const [building, setBuilding] = useState(false);

  const handleBuildContext = async () => {
    setBuilding(true);
    try {
      await requestInsightBuild();
      // 결과 갱신은 상위 대시보드의 폴링이 담당
    } catch {
      // 에러는 apiClient 인터셉터에서 처리
    } finally {
      setBuilding(false);
    }
  };

  const displayResults = results.filter((r) => RESULT_CARD_TYPES.includes(r.resultTypeCd));

  const latestAt = displayResults.length > 0
    ? displayResults.reduce((acc, r) => {
        const dt = r.updDt ?? r.regDt;
        return dt > acc ? dt : acc;
      }, displayResults[0].updDt ?? displayResults[0].regDt)
    : null;

  return (
    <Card className="p-4 bg-slate-700 border-slate-600">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-100">
            <Brain className="w-4 h-4 text-emerald-400" />
            AI 인사이트 분석
            {displayResults.length > 0 && (
              <Badge className="ml-1 text-white text-[10px] bg-emerald-600/80">
                {displayResults.length}개 섹션
              </Badge>
            )}
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5 ml-6">
            포트폴리오 + 설문 데이터를 종합 분석합니다
          </p>
        </div>
        <button
          onClick={handleBuildContext}
          disabled={building}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-500 text-white transition-colors flex-shrink-0"
        >
          <RefreshCw className={`w-3 h-3 ${building ? "animate-spin" : ""}`} />
          {building ? "분석 중..." : "결과보기"}
        </button>
      </div>

      {displayResults.length > 0 ? (
        <div className="space-y-2.5">
          {displayResults.map((item) => (
            <InsightSection key={item.resultTypeCd} item={item} />
          ))}
          {latestAt && (
            <p className="text-[10px] text-gray-500 text-right pt-1">
              마지막 분석: {new Date(latestAt).toLocaleString("ko-KR")}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* 빈 상태 안내 */}
          <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
            <Brain className="w-10 h-10 text-slate-500" />
            <p className="text-sm text-gray-300 font-medium">분석 전</p>
            <p className="text-xs text-gray-400">
              설문을 완료하고 포트폴리오를 등록한 후
              <br />
              결과보기 버튼을 눌러 AI 분석을 시작하세요.
            </p>
          </div>
          {/* 각 섹션 미리보기 */}
          <div className="space-y-2">
            {Object.entries(TYPE_META).map(([key, meta]) => (
              <div key={key} className={`rounded-xl border ${meta.colorClass} ${meta.borderClass} p-3`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{meta.icon}</span>
                  <div>
                    <p className={`text-xs font-bold ${meta.titleClass}`}>{meta.label}</p>
                    <p className="text-[10px] text-gray-500">{meta.subtitle}</p>
                  </div>
                </div>
                <ul className="space-y-1">
                  {meta.guide.points.slice(0, 2).map((point, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[10px] text-gray-600 flex-shrink-0 mt-0.5">{i + 1}.</span>
                      <p className="text-[10px] text-gray-500 leading-relaxed">{point}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
