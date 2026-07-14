import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { getGuruPortfolios, getPrevQuarter } from "@/app/services/guruService";
import { getPortfoliosByUser } from "@/app/services/portfolioService";
import { getPortfolioItems } from "@/app/services/portfolioItemService";
import { getAllInsightResults, generateStockMbti } from "@/app/services/insightService";
import { getSurveyWithMyResponses } from "@/app/services/surveyService";
import type {
  GuruPortfolioResponse,
  PortfolioResponse,
  PortfolioItemResponse,
  InsightResultResponse,
  SurveyWithMyResponse,
  ApiResponse,
} from "@/app/types";

import { StockMbtiCard } from "./insights/StockMbtiCard";
import { GuruMatchCard } from "./insights/GuruMatchCard";
import { InvestmentSurvey } from "@/app/components/survey/InvestmentSurvey";
import { StockFortuneCard } from "./fortune/StockFortuneCard";

type View = "landing" | "mbti" | "guru-match" | "survey" | "fortune";

interface Props {
  onRetakeSurvey?: () => void;
}

export function InvestorTypeDashboard({ onRetakeSurvey }: Props) {
  const [view, setView] = useState<View>("landing");
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItemResponse[]>([]);
  const [guruPortfolios, setGuruPortfolios] = useState<GuruPortfolioResponse[]>([]);
  const [insightResults, setInsightResults] = useState<InsightResultResponse[]>([]);
  // null = 조회 중 (라벨 미표시로 시작하기→결과보기 깜빡임 방지)
  const [hasRiskProfileResponse, setHasRiskProfileResponse] = useState<boolean | null>(null);
  const [resultsLoaded, setResultsLoaded] = useState(false);
  const [mbtiBuilding, setMbtiBuilding] = useState(false);

  const fetchResults = () => {
    getAllInsightResults()
      .then((res) => {
        const data = (res.data as ApiResponse<InsightResultResponse[]>).data;
        setInsightResults(Array.isArray(data) ? data : []);
        setResultsLoaded(true);
      })
      .catch(() => {});
  };

  // 투자 MBTI만 즉시 동기 생성 (설문 점수 기반, LLM/Kafka 미사용 → 대기 없음)
  const generateMbtiNow = useCallback(() => {
    setMbtiBuilding(true);
    return generateStockMbti()
      .then((res) => {
        const result = (res.data as ApiResponse<InsightResultResponse>).data;
        if (result) {
          setInsightResults((prev) => [
            ...prev.filter((r) => r.resultTypeCd !== "STOCK_MBTI"),
            result,
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setMbtiBuilding(false));
  }, []);

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

    getSurveyWithMyResponses()
      .then((res) => {
        const list = (res.data.data ?? []) as SurveyWithMyResponse[];
        setHasRiskProfileResponse(
          list.some(
            (s) => s.surveyTypeCode === "RISK_PROFILE" &&
                   (s.responseId != null || s.statusCode === "COMPLETED"),
          ),
        );
      })
      .catch(() => setHasRiskProfileResponse(false));

    fetchResults();
  }, []);

  const findResult = (typeCd: string) =>
    insightResults.find((r) => r.resultTypeCd === typeCd) ?? null;

  // 투자 MBTI: 설문 응답이 있으면 결과 뷰, 없으면 설문(나의 투자 성향 분석)으로 바로 이동
  const handleMbtiStart = () => {
    if (hasRiskProfileResponse === null) return; // 조회 중엔 무시 (잘못된 분기 방지)
    if (!hasRiskProfileResponse) setView("survey");
    else setView("mbti");
  };

  // 인플레이스 설문 완료 → MBTI 뷰로 이동 + 최신 응답으로 즉시 재생성
  const handleSurveyComplete = () => {
    setHasRiskProfileResponse(true);
    autoMbtiBuiltRef.current = true;   // 직접 재생성하므로 진입 effect 중복 방지
    setView("mbti");
    generateMbtiNow();
  };

  // MBTI 뷰 진입 시: 설문 응답은 있는데 결과가 없으면 즉시 생성 (LLM 없이 바로)
  const autoMbtiBuiltRef = useRef(false);
  useEffect(() => {
    if (view !== "mbti") { autoMbtiBuiltRef.current = false; return; }
    if (!resultsLoaded || !hasRiskProfileResponse || mbtiBuilding || autoMbtiBuiltRef.current) return;
    const mbti = findResult("STOCK_MBTI");
    const hasMbti = !!mbti && !(mbti.content ?? "").startsWith("설문 미완료");
    if (!hasMbti) {
      autoMbtiBuiltRef.current = true;
      generateMbtiNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, resultsLoaded, hasRiskProfileResponse, mbtiBuilding, insightResults]);

  const BackButton = () => (
    <button
      onClick={() => setView("landing")}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm font-medium text-gray-200 transition-colors hover:border-slate-500 hover:bg-slate-700 hover:text-white"
    >
      <ArrowLeft className="w-4 h-4" />
      투자 놀이터로 돌아가기
    </button>
  );

  if (view === "survey") {
    return (
      <div className="space-y-4 w-full max-w-4xl mx-auto">
        <BackButton />
        <InvestmentSurvey
          keyword=""
          autoOpenType="RISK_PROFILE"
          onComplete={handleSurveyComplete}
        />
      </div>
    );
  }

  if (view === "mbti") {
    return (
      <div className="space-y-4 w-full max-w-4xl mx-auto">
        <BackButton />
        <StockMbtiCard
          insightResult={findResult("STOCK_MBTI")}
          onRetakeSurvey={() => setView("survey")}
          onBuild={generateMbtiNow}
          building={mbtiBuilding}
        />
      </div>
    );
  }

  if (view === "guru-match") {
    return (
      <div className="space-y-4 w-full max-w-4xl mx-auto">
        <BackButton />
        <GuruMatchCard
          portfolioItems={portfolioItems}
          guruPortfolios={guruPortfolios}
        />
      </div>
    );
  }

  if (view === "fortune") {
    return (
      <div className="space-y-4 w-full max-w-4xl mx-auto">
        <BackButton />
        <StockFortuneCard />
      </div>
    );
  }

  return (
    <div className="space-y-5 w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-pink-400" />
        <h2 className="text-xl font-semibold text-gray-100">투자 놀이터</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <button
          onClick={handleMbtiStart}
          className="group text-left rounded-xl border border-pink-700/40 bg-gradient-to-br from-pink-900/50 to-rose-900/30 p-6 hover:border-pink-500/60 hover:from-pink-900/70 hover:to-rose-900/50 transition-all duration-200"
        >
          <div className="text-4xl mb-4">🧬</div>
          <h3 className="text-xl font-bold text-pink-200 mb-2 group-hover:text-pink-100 transition-colors">
            투자 MBTI 알아보기!
          </h3>
          <p className="text-base text-gray-400 leading-relaxed mb-5">
            44문항 통합 설문으로 나의 성격 MBTI와 투자 MBTI를 함께 알아보세요. 일반 MBTI와 16가지 투자 성향 분석으로 당신의 투자 스타일을 찾아보세요.
          </p>
          <span className="inline-flex items-center gap-1.5 text-base font-semibold text-pink-300 group-hover:text-pink-200 group-hover:gap-3 transition-all duration-200">
            {hasRiskProfileResponse === null
              ? " "
              : hasRiskProfileResponse
                ? "결과보기 →"
                : "시작하기 →"}
          </span>
        </button>

        <button
          onClick={() => setView("guru-match")}
          className="group text-left rounded-xl border border-indigo-700/40 bg-gradient-to-br from-indigo-900/50 to-purple-900/30 p-6 hover:border-indigo-500/60 hover:from-indigo-900/70 hover:to-purple-900/50 transition-all duration-200"
        >
          <div className="text-4xl mb-4">👑</div>
          <h3 className="text-xl font-bold text-indigo-200 mb-2 group-hover:text-indigo-100 transition-colors">
            내 포트폴리오와 맞는 투자 대가는?
          </h3>
          <p className="text-base text-gray-400 leading-relaxed mb-5">
            내가 보유한 종목을 워런 버핏, 조지 소로스 등 전설적 투자자들의 포트폴리오와 비교해보세요.
          </p>
          <span className="inline-flex items-center gap-1.5 text-base font-semibold text-indigo-300 group-hover:text-indigo-200 group-hover:gap-3 transition-all duration-200">
            알아보기 →
          </span>
        </button>

        <button
          onClick={() => setView("fortune")}
          className="group text-left rounded-xl border border-amber-700/40 bg-gradient-to-br from-amber-900/50 to-orange-900/30 p-6 hover:border-amber-500/60 hover:from-amber-900/70 hover:to-orange-900/50 transition-all duration-200"
        >
          <div className="text-4xl mb-4">🔮</div>
          <h3 className="text-xl font-bold text-amber-200 mb-2 group-hover:text-amber-100 transition-colors">
            오늘의 종목운세
          </h3>
          <p className="text-base text-gray-400 leading-relaxed mb-5">
            궁금한 종목의 오늘 기운을 점쳐보세요. 별자리, 숫자 궁합, 로고 색상까지 총동원한 재미용 운세입니다.
          </p>
          <span className="inline-flex items-center gap-1.5 text-base font-semibold text-amber-300 group-hover:text-amber-200 group-hover:gap-3 transition-all duration-200">
            운세 보기 →
          </span>
        </button>
      </div>
    </div>
  );
}
