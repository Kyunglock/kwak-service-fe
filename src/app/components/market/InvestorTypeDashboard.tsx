import { useState, useEffect } from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
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

import { StockMbtiCard } from "./insights/StockMbtiCard";
import { GuruMatchCard } from "./insights/GuruMatchCard";

type View = "landing" | "mbti" | "guru-match";

interface Props {
  onRetakeSurvey?: () => void;
}

export function InvestorTypeDashboard({ onRetakeSurvey }: Props) {
  const [view, setView] = useState<View>("landing");
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItemResponse[]>([]);
  const [guruPortfolios, setGuruPortfolios] = useState<GuruPortfolioResponse[]>([]);
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

  const BackButton = () => (
    <button
      onClick={() => setView("landing")}
      className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      투자 놀이터로 돌아가기
    </button>
  );

  if (view === "mbti") {
    return (
      <div className="space-y-4">
        <BackButton />
        <StockMbtiCard
          insightResult={findResult("STOCK_MBTI")}
          onRetakeSurvey={onRetakeSurvey}
          onBuildComplete={setInsightResults}
        />
      </div>
    );
  }

  if (view === "guru-match") {
    return (
      <div className="space-y-4">
        <BackButton />
        <GuruMatchCard
          portfolioItems={portfolioItems}
          guruPortfolios={guruPortfolios}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-pink-400" />
        <h2 className="text-lg font-semibold text-gray-100">투자 놀이터</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <button
          onClick={() => setView("mbti")}
          className="group text-left rounded-xl border border-pink-700/40 bg-gradient-to-br from-pink-900/50 to-rose-900/30 p-6 hover:border-pink-500/60 hover:from-pink-900/70 hover:to-rose-900/50 transition-all duration-200"
        >
          <div className="text-4xl mb-4">🧬</div>
          <h3 className="text-lg font-bold text-pink-200 mb-2 group-hover:text-pink-100 transition-colors">
            투자 MBTI 알아보기!
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-5">
            설문 응답을 기반으로 나만의 투자 유형 코드를 확인해보세요. GRL, VST 등 8가지 유형 중 나는 어디에 속할까요?
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-pink-300 group-hover:text-pink-200 group-hover:gap-3 transition-all duration-200">
            시작하기 →
          </span>
        </button>

        <button
          onClick={() => setView("guru-match")}
          className="group text-left rounded-xl border border-indigo-700/40 bg-gradient-to-br from-indigo-900/50 to-purple-900/30 p-6 hover:border-indigo-500/60 hover:from-indigo-900/70 hover:to-purple-900/50 transition-all duration-200"
        >
          <div className="text-4xl mb-4">👑</div>
          <h3 className="text-lg font-bold text-indigo-200 mb-2 group-hover:text-indigo-100 transition-colors">
            내 포트폴리오와 맞는 투자 대가는?
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-5">
            내가 보유한 종목을 워런 버핏, 조지 소로스 등 전설적 투자자들의 포트폴리오와 비교해보세요.
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-300 group-hover:text-indigo-200 group-hover:gap-3 transition-all duration-200">
            알아보기 →
          </span>
        </button>
      </div>
    </div>
  );
}
