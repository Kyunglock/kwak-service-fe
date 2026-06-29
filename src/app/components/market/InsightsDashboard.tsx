import { useState, useEffect } from "react";
import { PieChart, RefreshCw } from "lucide-react";
import { CurrencyToggleButton } from "@/app/components/ui/CurrencyToggleButton";
import { getPortfoliosByUser } from "@/app/services/portfolioService";
import { getPortfolioItems } from "@/app/services/portfolioItemService";
import { getAllInsightResults } from "@/app/services/insightService";
import type {
  PortfolioResponse,
  PortfolioItemResponse,
  InsightResultResponse,
  ApiResponse,
} from "@/app/types";

import { SectorAnalysisCard } from "./insights/SectorAnalysisCard";
import { KeyInsightsCard } from "./insights/KeyInsightsCard";
import { DivergenceInsightsCard } from "./insights/DivergenceInsightsCard";
import { ProfileFitCard } from "./insights/ProfileFitCard";
import { useInsightBuild } from "@/app/hooks/useInsightBuild";

export function InsightsDashboard() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItemResponse[]>([]);
  const [insightResults, setInsightResults] = useState<InsightResultResponse[]>([]);

  const fetchResults = () => {
    getAllInsightResults()
      .then((res) => {
        const data = (res.data as ApiResponse<InsightResultResponse[]>).data;
        setInsightResults(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  };

  const { isProcessing, trigger } = useInsightBuild(fetchResults);

  useEffect(() => {
    getPortfoliosByUser()
      .then(async (res) => {
        const portfolios: PortfolioResponse[] = (
          res.data as ApiResponse<PortfolioResponse[]>
        ).data;
        const itemResults = await Promise.all(
          portfolios.map((p) =>
            getPortfolioItems(p.portfolioId)
              .then((r) => (r.data as ApiResponse<PortfolioItemResponse[]>).data)
              .catch(() => [] as PortfolioItemResponse[]),
          ),
        );
        setPortfolioItems(itemResults.flat());
      })
      .catch(() => {});

    fetchResults();
  }, []);

  const findResult = (typeCd: string) =>
    insightResults.find((r) => r.resultTypeCd === typeCd) ?? null;

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
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-500 text-white transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isProcessing ? "animate-spin" : ""}`} />
            {isProcessing ? "분석 중..." : "결과 생성"}
          </button>
          <CurrencyToggleButton />
        </div>
      </div>

      {/* 프로필 적합도 + 주요 발견 — 2열 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ProfileFitCard insightResult={findResult("PROFILE_FIT")} building={isProcessing} />
        <KeyInsightsCard insightResult={findResult("KEY_FINDINGS")} />
      </div>

      {/* 재무 이상 징후 */}
      <DivergenceInsightsCard portfolioItems={portfolioItems} />

      {/* 섹터 분석 */}
      <SectorAnalysisCard />
    </div>
  );
}
