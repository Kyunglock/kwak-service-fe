import { useState, useEffect } from "react";
import { PieChart, RefreshCw, Sparkles, AlertTriangle, ClipboardList, ArrowLeft } from "lucide-react";
import { CurrencyToggleButton } from "@/app/components/ui/CurrencyToggleButton";
import { getAllInsightResults } from "@/app/services/insightService";
import { getSurveyWithMyResponses } from "@/app/services/surveyService";
import type {
  InsightResultResponse,
  SurveyWithMyResponse,
  ApiResponse,
} from "@/app/types";

import { ProfileFitCard } from "./insights/ProfileFitCard";
import { DividendInsightCard } from "./insights/DividendInsightCard";
import { InvestmentSurvey } from "@/app/components/survey/InvestmentSurvey";
import { useInsightBuild } from "@/app/hooks/useInsightBuild";

export function InsightsDashboard() {
  const [insightResults, setInsightResults] = useState<InsightResultResponse[]>([]);
  // 성향 설문(RISK_PROFILE) 완료 여부 — null이면 확인 중
  const [hasRiskProfile, setHasRiskProfile] = useState<boolean | null>(null);
  const [showSurvey, setShowSurvey] = useState(false);

  const fetchResults = () => {
    getAllInsightResults()
      .then((res) => {
        const data = (res.data as ApiResponse<InsightResultResponse[]>).data;
        setInsightResults(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  };

  const { isProcessing, status, trigger } = useInsightBuild(fetchResults);

  useEffect(() => {
    fetchResults();
    getSurveyWithMyResponses()
      .then((res) => {
        const list = (res.data.data ?? []) as SurveyWithMyResponse[];
        setHasRiskProfile(
          list.some(
            (s) =>
              s.surveyTypeCode === "RISK_PROFILE" &&
              (s.responseId != null || s.statusCode === "COMPLETED"),
          ),
        );
      })
      .catch(() => setHasRiskProfile(false));
  }, []);

  const findResult = (typeCd: string) =>
    insightResults.find((r) => r.resultTypeCd === typeCd) ?? null;

  // 설문 완료 → 대시보드 복귀 (결과 생성은 사용자가 직접)
  const handleSurveyComplete = () => {
    setHasRiskProfile(true);
    setShowSurvey(false);
  };

  if (showSurvey) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowSurvey(false)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm font-medium text-gray-200 transition-colors hover:border-slate-500 hover:bg-slate-700 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          인사이트로 돌아가기
        </button>
        <InvestmentSurvey keyword="" autoOpenType="RISK_PROFILE" onComplete={handleSurveyComplete} />
      </div>
    );
  }

  const surveyRequired = hasRiskProfile === false;

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-semibold text-gray-100">투자자 인사이트</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={trigger}
            disabled={isProcessing || surveyRequired}
            title={surveyRequired ? "투자 성향 설문을 먼저 완료해주세요" : undefined}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-500 text-white transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isProcessing ? "animate-spin" : ""}`} />
            {isProcessing ? "분석 중..." : "결과 생성"}
          </button>
          <CurrencyToggleButton />
        </div>
      </div>

      {/* 성향 설문 필수 게이트 */}
      {surveyRequired && (
        <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-slate-800 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-5 h-5 text-cyan-300" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-cyan-200">먼저 투자 성향 분석이 필요해요</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  성향 적합도와 배당 인사이트는 <b>나의 투자 성향 분석</b> 설문 결과를 바탕으로 생성됩니다.
                  1~2분이면 끝나요.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSurvey(true)}
              className="flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
            >
              설문 시작하기
            </button>
          </div>
        </div>
      )}

      {/* 분석 진행 배너 */}
      {isProcessing && (
        <div className="rounded-xl border border-teal-500/30 bg-gradient-to-r from-teal-950/60 to-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0 w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-teal-400/20 border-t-teal-300 animate-spin" />
              <Sparkles className="w-4 h-4 text-teal-300 absolute inset-0 m-auto" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-teal-200">AI가 포트폴리오를 분석하고 있어요</p>
              <p className="text-xs text-gray-400 mt-0.5">
                보유 종목·설문·배당 데이터를 종합해 인사이트를 생성 중입니다. 보통 30초~1분 정도 걸려요.
              </p>
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-slate-700/80 rounded-full overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-teal-500/20 via-teal-300 to-teal-500/20 animate-pulse rounded-full" />
          </div>
        </div>
      )}

      {/* 분석 실패 안내 */}
      {status === "FAILED" && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-300">분석에 실패했습니다. 잠시 후 "결과 생성"을 다시 눌러주세요.</p>
        </div>
      )}

      {/* 성향 적합도 + 배당 인사이트 2열 (모바일은 1열) — 설문 미완료 시 흐림 처리 */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-5 items-start ${
          surveyRequired ? "opacity-40 pointer-events-none select-none" : ""
        }`}
      >
        <ProfileFitCard insightResult={findResult("PROFILE_FIT")} building={isProcessing} />
        <DividendInsightCard insightResult={findResult("DIVIDEND_INSIGHT")} building={isProcessing} />
      </div>
    </div>
  );
}
