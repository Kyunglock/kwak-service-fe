import { useState, useEffect } from "react";
import { PieChartIcon as PieChart } from "lucide-react";
import { CurrencyToggleButton } from "@/app/components/ui/CurrencyToggleButton";
import { getGuruPortfolios, getPrevQuarter } from "@/app/services/guruService";
import { getPortfoliosByUser } from "@/app/services/portfolioService";
import { getPortfolioItems } from "@/app/services/portfolioItemService";
import { getAllInsightResults } from "@/app/services/insightService";
import type {
  GuruPortfolioResponse,
  PortfolioResponse,
  PortfolioItemResponse,
  InsightResultResponse,
  ApiResponse,
} from "@/app/types";

import { GuruMatchCard } from "./insights/GuruMatchCard";
import { SectorAnalysisCard } from "./insights/SectorAnalysisCard";
import { KeyInsightsCard } from "./insights/KeyInsightsCard";
import { StockMbtiCard } from "./insights/StockMbtiCard";
import { DivergenceInsightsCard } from "./insights/DivergenceInsightsCard";

interface Props {
  onRetakeSurvey?: () => void;
}

export function InsightsDashboard({ onRetakeSurvey }: Props) {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItemResponse[]>([]);
  const [guruPortfolios, setGuruPortfolios]   = useState<GuruPortfolioResponse[]>([]);
  const [insightResults, setInsightResults]   = useState<InsightResultResponse[]>([]);

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

    getGuruPortfolios(getPrevQuarter())
      .then((res) => {
        const d = res.data.data;
        setGuruPortfolios(Array.isArray(d) ? d : (d?.content ?? []));
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
    <div className="p-4 space-y-4 pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PieChart className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-semibold text-gray-100">투자자 인사이트</h2>
        </div>
        <CurrencyToggleButton />
      </div>

      {/* 안내 배너 */}
      <div className="bg-green-950 border border-green-800 rounded-lg p-3 text-sm text-green-300">
        <p className="font-medium mb-1">📊 실시간 투자 트렌드</p>
        <p className="text-xs">
          전체 사용자의 설문 응답을 집계하여 시장 심리를 분석했습니다.
        </p>
      </div>

      {/* STOCK_MBTI */}
      <StockMbtiCard
        insightResult={findResult("STOCK_MBTI")}
        onRetakeSurvey={onRetakeSurvey}
        onBuildComplete={setInsightResults}
      />

      {/* KEY_FINDINGS */}
      <KeyInsightsCard insightResult={findResult("KEY_FINDINGS")} />

      {/* 재무 이상 징후 감지 */}
      <DivergenceInsightsCard portfolioItems={portfolioItems} />

      <GuruMatchCard
        portfolioItems={portfolioItems}
        guruPortfolios={guruPortfolios}
      />
      <SectorAnalysisCard />

      {/* 푸터 */}
      <div className="text-center text-xs text-gray-500 mt-4">
        <p>마지막 업데이트: 2026-01-11 08:00 (KST)</p>
        <p className="mt-1">총 응답자: 1,230명</p>
      </div>
    </div>
  );
}
