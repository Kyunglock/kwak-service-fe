import { useState, useEffect } from "react";
import { PieChart } from "lucide-react";
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

export function InsightsDashboard() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItemResponse[]>([]);
  const [insightResults, setInsightResults] = useState<InsightResultResponse[]>([]);

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

    getAllInsightResults()
      .then((res) => {
        const data = (res.data as ApiResponse<InsightResultResponse[]>).data;
        setInsightResults(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
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
        <CurrencyToggleButton />
      </div>

      {/* 주요 발견 + 재무 이상 징후 — 2열 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <KeyInsightsCard insightResult={findResult("KEY_FINDINGS")} />
        <DivergenceInsightsCard portfolioItems={portfolioItems} />
      </div>

      {/* 섹터 분석 */}
      <SectorAnalysisCard />
    </div>
  );
}
