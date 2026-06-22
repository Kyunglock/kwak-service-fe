import { useState, useEffect } from "react";
import { Lightbulb, AlertCircle, CheckCircle, Sparkles, ChevronRight, TrendingUp, ShieldAlert } from "lucide-react";

interface Stock {
  symbol: string;
  nameEn: string;
  nameKo: string;
  sector: string;
  recommendationType: "balance" | "growth" | "dividend" | "survey";
  pros: string[];
  risks: string[];
}

interface PortfolioPosition {
  id: string;
  symbol: string;
  sector: string;
  quantity: number;
}

export function StockRecommendations() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<{
    currentAllocation: { [key: string]: number };
    surveyPreference: string;
    needsBalancing: boolean;
    recommendations: string[];
  } | null>(null);

  useEffect(() => {
    setTimeout(() => {
      const analysis = analyzePortfolioAndSurvey();
      setAnalysisResult(analysis);
      const recommendations = generateSmartRecommendations(analysis);
      setStocks(recommendations);
      setLoading(false);
    }, 1000);
  }, []);

  const analyzePortfolioAndSurvey = () => {
    const savedPortfolio = localStorage.getItem("portfolio");
    const mockPortfolio: PortfolioPosition[] = [
      { id: "1", symbol: "AAPL",  sector: "기술",     quantity: 10 },
      { id: "2", symbol: "MSFT",  sector: "기술",     quantity: 5  },
      { id: "3", symbol: "NVDA",  sector: "기술",     quantity: 8  },
      { id: "4", symbol: "GOOGL", sector: "기술",     quantity: 3  },
      { id: "5", symbol: "JNJ",   sector: "헬스케어", quantity: 6  },
      { id: "6", symbol: "UNH",   sector: "헬스케어", quantity: 4  },
      { id: "7", symbol: "PG",    sector: "소비재",   quantity: 7  },
      { id: "8", symbol: "KO",    sector: "소비재",   quantity: 5  },
      { id: "9", symbol: "XOM",   sector: "에너지",   quantity: 3  },
    ];
    const portfolio: PortfolioPosition[] = savedPortfolio ? JSON.parse(savedPortfolio) : mockPortfolio;
    const savedSurveys = localStorage.getItem("surveyAnswers");
    const surveys = savedSurveys ? JSON.parse(savedSurveys) : {};

    const sectorAllocation: { [key: string]: number } = {};
    portfolio.forEach(pos => {
      sectorAllocation[pos.sector] = (sectorAllocation[pos.sector] || 0) + 1;
    });

    const totalPositions = portfolio.length;
    const sectorPercentages: { [key: string]: number } = {};
    Object.keys(sectorAllocation).forEach(sector => {
      sectorPercentages[sector] = (sectorAllocation[sector] / totalPositions) * 100;
    });

    let surveyPreference = "균형";
    const latestSurvey = Object.values(surveys)[Object.values(surveys).length - 1] as Record<string, string> | undefined;
    if (latestSurvey?.q5) {
      const sectorMap: { [key: string]: string } = {
        tech: "기술주", healthcare: "헬스케어", consumer: "소비재", energy: "에너지"
      };
      surveyPreference = sectorMap[latestSurvey.q5] || "균형";
    }

    const maxSectorPercent = Math.max(...Object.values(sectorPercentages), 0);
    const needsBalancing = maxSectorPercent > 50 || portfolio.length === 0;
    const recommendations: string[] = [];

    if (portfolio.length === 0) {
      recommendations.push("현재 포트폴리오에 보유 종목이 없습니다.");
      recommendations.push("섹터 분산 없이 단일 종목에 집중되면 시장 충격에 취약해질 수 있습니다.");
    } else {
      const sortedSectors = Object.entries(sectorPercentages).sort((a, b) => b[1] - a[1]);
      const topSector = sortedSectors[0];
      const totalStocks = portfolio.length;

      recommendations.push(`현재 총 ${totalStocks}개 종목을 ${Object.keys(sectorPercentages).length}개 섹터에 걸쳐 보유 중입니다.`);

      if (maxSectorPercent > 60) {
        recommendations.push(`${topSector[0]} 섹터가 전체의 ${topSector[1].toFixed(0)}%를 차지하고 있어 특정 섹터에 집중된 상태입니다.`);
        recommendations.push(`${topSector[0]} 업황이 흔들릴 경우 포트폴리오 전체가 영향을 받을 수 있는 구조입니다.`);
      } else if (maxSectorPercent > 40) {
        recommendations.push(`${topSector[0]} 섹터 비중이 ${topSector[1].toFixed(0)}%로 가장 높게 형성되어 있습니다.`);
        recommendations.push(`전반적으로 균형잡힌 편이나, 비중이 낮은 섹터를 보완하면 안정성이 높아질 수 있습니다.`);
      } else {
        recommendations.push(`섹터별 비중이 비교적 고르게 분산되어 있는 안정적인 구조입니다.`);
      }

      const allSectors = ["기술", "헬스케어", "소비재", "에너지"];
      const missingSectors = allSectors.filter(sector =>
        !Object.keys(sectorAllocation).some(s => s.includes(sector))
      );
      if (missingSectors.length > 0) {
        recommendations.push(`${missingSectors.join(", ")} 섹터는 현재 포트폴리오에 포함되어 있지 않습니다.`);
      }
    }

    return { currentAllocation: sectorPercentages, surveyPreference, needsBalancing, recommendations };
  };

  const generateSmartRecommendations = (analysis: ReturnType<typeof analyzePortfolioAndSurvey>): Stock[] => {
    const allStocks: Stock[] = [
      {
        symbol: "NVDA", nameEn: "NVIDIA Corporation", nameKo: "엔비디아", sector: "기술",
        recommendationType: "growth",
        pros: [
          "AI 데이터센터 수요 폭증으로 GPU 가격 결정력 및 마진 지속 개선",
          "CUDA 생태계 독점 지위로 경쟁사 진입 장벽 압도적으로 높음",
          "Blackwell 아키텍처 출시로 2025년 매출 재도약 기대",
        ],
        risks: [
          "고밸류에이션(PER 40배+)으로 실적 미스 시 급락 가능성",
          "미·중 반도체 규제 강화로 중국 수출 매출 타격 우려",
          "AMD·인텔의 AI 가속기 추격으로 점유율 잠식 가능성",
        ],
      },
      {
        symbol: "META", nameEn: "Meta Platforms", nameKo: "메타 플랫폼스", sector: "기술",
        recommendationType: "growth",
        pros: [
          "AI 타겟팅 고도화로 광고 매출 전년 대비 19% 성장 달성",
          "Llama 오픈소스 전략으로 AI 개발자 생태계 주도권 확보",
          "공격적 자사주 매입(연 500억 달러)으로 주주환원 극대화",
        ],
        risks: [
          "메타버스(Reality Labs) 누적 적자 500억 달러 초과, 수익화 불투명",
          "EU·미국 개인정보 규제 강화로 타겟 광고 효율 저하 위험",
          "10대 사용자 이탈 및 TikTok 경쟁 심화로 사용자 성장 둔화 우려",
        ],
      },
      {
        symbol: "AMD", nameEn: "Advanced Micro Devices", nameKo: "어드밴스드 마이크로 디바이시스", sector: "기술",
        recommendationType: "growth",
        pros: [
          "서버용 EPYC CPU 점유율 35% 돌파, 전력효율에서 Intel 압도",
          "MI300X AI 가속기로 엔비디아 대안 수요 흡수 및 매출 급성장",
          "NVDA 대비 저평가 구간, 리스크 대비 기대수익 매력적",
        ],
        risks: [
          "NVIDIA CUDA 생태계 의존도 높아 소프트웨어 호환성 열위",
          "AI 가속기 수요 예측 불확실성으로 재고 리스크 상존",
          "파운드리 위탁생산 의존(TSMC)으로 공급망 리스크 노출",
        ],
      },
      {
        symbol: "JNJ", nameEn: "Johnson & Johnson", nameKo: "존슨앤드존슨", sector: "헬스케어",
        recommendationType: "balance",
        pros: [
          "62년 연속 배당 증가, 배당 귀족 지위로 인컴 투자 안정성 최고",
          "의약품·의료기기 이중 사��� 구조로 경기 침체에도 매출 방어",
          "탈크 분쟁 합의 완료로 법적 불확실성 해소, 주가 재평가 구간",
        ],
        risks: [
          "특허 만료 의약품 비중 증가로 2025~2026년 매출 성장 둔화 우려",
          "미국 약가 인하 정책(IRA) 영향으로 주요 약품 수익성 압박",
          "의료기기 부문 경쟁 심화로 시장 점유율 방어 비용 증가",
        ],
      },
      {
        symbol: "PG", nameEn: "Procter & Gamble", nameKo: "프록터앤드갬블", sector: "소비재",
        recommendationType: "balance",
        pros: [
          "Tide·Gillette 등 65개 이상 글로벌 1·2위 브랜드로 가격 전가력 탁월",
          "68년 연속 배당 증가, 배당 킹 지위로 장기 인컴 투자 핵심 종목",
          "인도·중동 신흥시장 점유율 확대로 추가 성장 여력 확보",
        ],
        risks: [
          "원자재 가격 재상승 시 마진 압박으로 이익 성장 둔화 가능",
          "신흥시장 환율 변동성 확대로 해외 매출 환산 손실 위험",
          "PB(자체 브랜드) 상품 성장으로 저가 제품군 시장 점유율 잠식",
        ],
      },
      {
        symbol: "KO", nameEn: "The Coca-Cola Company", nameKo: "코카콜라", sector: "소비재",
        recommendationType: "dividend",
        pros: [
          "200개국 판매망, 62년 연속 배당 증가로 안정적 인컴 창출",
          "제로·기능성 음료 라인업 확대로 건강 트렌드에 적극 대응",
          "금리 인하 사이클 진입 시 고배당주 재평가 수혜 기대",
        ],
        risks: [
          "설탕세·건강 규제 강화로 핵심 탄산음료 수요 장기 감소 우려",
          "신흥시장 통화 약세로 달러 환산 매출 및 이익 감소 위험",
          "경쟁사(펩시코) 다각화 전략 대비 음료 사업 집중으로 성장 한계",
        ],
      },
      {
        symbol: "VZ", nameEn: "Verizon Communications", nameKo: "버라이즌 커뮤니케이션스", sector: "통신",
        recommendationType: "dividend",
        pros: [
          "배당수익률 6.8%, 동종업계 최고 수준의 고배당 매력",
          "5G 전국 커버리지 완성 및 정 무선(FWA) 가입자 분기 50만+ 달성",
          "금리 하락 기대감과 함께 배당주 매력도 재부각 국면",
        ],
        risks: [
          "높은 부채 수준(순부채 $1,500억+)으로 금리 상승 시 이자 부담 증가",
          "AT&T·T-Mobile과의 가격 경쟁 심화로 가입자당 매출(ARPU) 하락",
          "5G 인프라 투자 지속으로 자유현금흐름(FCF) 제한, 배당 성장 여력 낮음",
        ],
      },
      {
        symbol: "TSLA", nameEn: "Tesla Inc", nameKo: "테슬라", sector: "에너지",
        recommendationType: "survey",
        pros: [
          "FSD v12 뉴럴넷 전환으로 완전자율주행 수익화 임박",
          "에너지 저장(Megapack) 사업 고마진 성장, 전기차 외 수익 다변화",
          "옵티머스 로봇 양산 계획으로 제조업 AI 혁신 신성장 동력 확보",
        ],
        risks: [
          "글로벌 전기차 경쟁 심화(BYD·현대차)로 점유율 및 마진 동반 하락",
          "머스크 CEO 정치적 행보로 브랜드 이미지 훼손 및 유럽 불매 확산",
          "고밸류에이션 구간에서 실적 기대치 미달 시 주가 변동성 극심",
        ],
      },
      {
        symbol: "NEE", nameEn: "NextEra Energy", nameKo: "넥스트에라 에너지", sector: "에너지",
        recommendationType: "balance",
        pros: [
          "미국 최대 태양광·풍력 발전사, AI 데이터센터 전력 수요 급증 직접 수혜",
          "IRA 세액공제 수혜로 재생에너지 프로젝트 수익성(IRR) 대폭 개선",
          "배당 성장률 10% 목표 유지, 장기 인컴 투자자에게 안정적 매력",
        ],
        risks: [
          "금리 상승 시 자본 조달 비용 증가로 신규 프로젝트 수익성 악화",
          "규제 변화(IRA 수정·축소) 시 세액공제 혜택 감소로 실적 타격",
          "자연재해(허리케인 등) 빈도 증가로 발전 설비 피해 리스크 상존",
        ],
      },
      {
        symbol: "PFE", nameEn: "Pfizer Inc", nameKo: "화이자", sector: "헬스케어",
        recommendationType: "dividend",
        pros: [
          "배당수익률 6.1%, 코로나 특수 종료 후 저점 구간으로 저가 매수 기회",
          "Seagen 인수로 ADC(항체-약물 복합체) 항암 파이프라인 대폭 강화",
          "비만치료제(GLP-1) 경구용 후보물질 임상 3상 진입, 대형 촉매 대기",
        ],
        risks: [
          "코로나 백신·치료제 매출 급감으로 2024~2025년 실적 역성장 구간",
          "특허 만료 제품 다수로 2025년 이후 제네릭 경쟁 본격화",
          "Seagen 인수 비용 부담으로 재무 레버리지 상승, 배당 축소 우려",
        ],
      },
      {
        symbol: "UNH", nameEn: "UnitedHealth Group", nameKo: "유나이티드헬스 그룹", sector: "헬스케어",
        recommendationType: "balance",
        pros: [
          "Optum 헬스 플랫폼 매출 $2,000억 돌파, 의료 데이터 생태계 독점",
          "13년 연속 두 자릿수 EPS 성장, 복합성장률(CAGR) 12% 유지",
          "고령화·메디케어 어드밴티지 시장 성장의 구조적 장기 수혜",
        ],
        risks: [
          "미국 의료비 규제 강화 및 메디케어 수가 인하 정책 리스크",
          "사이버 공격(2024년 Change Healthcare 해킹) 재발 시 막대한 손실",
          "의료 손해율(MLR) 상승으로 보험 부문 수익성 하락 추세",
        ],
      },
      {
        symbol: "ABBV", nameEn: "AbbVie Inc", nameKo: "애브비", sector: "헬스케어",
        recommendationType: "balance",
        pros: [
          "Skyrizi·Rinvoq 매출 급성장으로 휴미라 특허 절벽 성공적 극복",
          "신경과학·종양학 파이프라인 확충으로 2025년 이후 성장 재가속 전망",
          "배당 성장 12년 이상 유지, 배당 귀족 편입 및 주주환원 안정적",
        ],
        risks: [
          "주요 신약 임상 실패 시 파이프라인 공백으로 중기 성장 둔화",
          "Skyrizi·Rinvoq 의존도 심화로 해당 약물 경쟁 격화 시 타격",
          "미국 약가 인하 정책(IRA) 협상 대상 포함 시 수익성 압박",
        ],
      },
    ];

    let recommended: Stock[] = [];

    if (analysis.needsBalancing) {
      const currentSectors = Object.keys(analysis.currentAllocation);
      const dominantSector = currentSectors.length > 0
        ? Object.entries(analysis.currentAllocation).sort((a, b) => b[1] - a[1])[0][0]
        : "";

      if (dominantSector.includes("기술") && analysis.currentAllocation[dominantSector] > 50) {
        recommended = allStocks.filter(s => s.recommendationType === "balance" || s.recommendationType === "dividend");
      } else if (currentSectors.length === 0) {
        recommended = [
          ...allStocks.filter(s => s.recommendationType === "balance").slice(0, 3),
          ...allStocks.filter(s => s.recommendationType === "dividend").slice(0, 2),
        ];
      } else {
        const allSectorTypes = ["기술", "헬스케어", "소비재", "에너지"];
        const missingSectors = allSectorTypes.filter(sector =>
          !currentSectors.some(s => s.includes(sector))
        );
        if (missingSectors.length > 0) {
          recommended = allStocks.filter(s =>
            missingSectors.some(missing => s.sector.includes(missing))
          );
        }
      }
    }

    if (analysis.surveyPreference !== "균형") {
      const surveyBased = allStocks.filter(s =>
        s.sector.includes(analysis.surveyPreference.replace("주", ""))
      ).slice(0, 2);
      recommended = [...recommended, ...surveyBased];
    }

    if (recommended.length < 5) {
      const balanced = allStocks.filter(s =>
        s.recommendationType === "balance" && !recommended.includes(s)
      );
      recommended = [...recommended, ...balanced];
    }

    const unique = Array.from(new Map(recommended.map(s => [s.symbol, s])).values());
    return unique.slice(0, 5);
  };

  const sectorColors: Record<string, { bg: string; border: string; dot: string; sectorBadge: string; accentText: string }> = {
    "기술":     { bg: "from-slate-700/90 to-slate-800/90", border: "border-slate-500/70", dot: "bg-slate-400", sectorBadge: "text-slate-200 bg-slate-600/60 border-slate-400/50", accentText: "text-slate-200" },
    "헬스케어": { bg: "from-slate-700/90 to-slate-800/90", border: "border-slate-500/70", dot: "bg-slate-400", sectorBadge: "text-slate-200 bg-slate-600/60 border-slate-400/50", accentText: "text-slate-200" },
    "소비재":   { bg: "from-slate-700/90 to-slate-800/90", border: "border-slate-500/70", dot: "bg-slate-400", sectorBadge: "text-slate-200 bg-slate-600/60 border-slate-400/50", accentText: "text-slate-200" },
    "에너지":   { bg: "from-slate-700/90 to-slate-800/90", border: "border-slate-500/70", dot: "bg-slate-400", sectorBadge: "text-slate-200 bg-slate-600/60 border-slate-400/50", accentText: "text-slate-200" },
    "통신":     { bg: "from-slate-700/90 to-slate-800/90", border: "border-slate-500/70", dot: "bg-slate-400", sectorBadge: "text-slate-200 bg-slate-600/60 border-slate-400/50", accentText: "text-slate-200" },
  };

  const typeLabels: Record<string, { label: string; color: string }> = {
    growth:   { label: "성장주", color: "text-violet-300 bg-violet-900/50 border-violet-600/40" },
    balance:  { label: "균형형", color: "text-cyan-300 bg-cyan-900/50 border-cyan-600/40" },
    dividend: { label: "배당주", color: "text-amber-300 bg-amber-900/50 border-amber-600/40" },
    survey:   { label: "설문추천", color: "text-emerald-300 bg-emerald-900/50 border-emerald-600/40" },
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4 pb-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-100">투자 아이디어</h2>
            <p className="text-xs text-gray-400">AI 포트폴리오 분석 기반 맞춤 추천</p>
          </div>
        </div>
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"></div>
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-cyan-900 to-blue-900 border border-cyan-700 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <p className="text-sm text-gray-300">AI가 포트폴리오를 분석 중입니다...</p>
          <p className="text-xs text-gray-500 mt-1">설문 응답과 보유 종목을 교차 분석합니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5 pb-20">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <Lightbulb className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-100">투자 아이디어</h2>
          <p className="text-xs text-gray-400">AI 포트폴리오 분석 기반 맞춤 추천</p>
        </div>
      </div>

      {/* 포트폴리오 분석 결과 */}
      {analysisResult && (
        <div className="rounded-2xl overflow-hidden border border-cyan-700/40 bg-gradient-to-br from-cyan-950/70 to-blue-950/70">
          <div className="px-4 pt-3.5 pb-3 flex items-center gap-2.5 border-b border-white/10">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-sm font-semibold text-cyan-300">포트폴리오 분석</span>
          </div>
          <div className="p-4 space-y-2">
            {analysisResult.recommendations.length > 0 ? (
              analysisResult.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2 text-xs text-gray-300">
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle className="w-4 h-4" />
                포트폴리가 균형잡혀 있습니다.
              </div>
            )}
            {/* 섹터 비중 - 항상 표시 */}
            <div className="pt-3 border-t border-white/10">
              <div className="text-xs text-gray-400 mb-3">현재 섹터 비중</div>
              {Object.keys(analysisResult.currentAllocation).length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-2">포트폴리오에 종목을 추가하면 섹터 비중이 표시됩니다.</div>
              ) : (
                <div className="space-y-2.5">
                  {Object.entries(analysisResult.currentAllocation)
                    .sort((a, b) => b[1] - a[1])
                    .map(([sector, percent]) => (
                      <div key={sector}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-300">{sector}</span>
                          <span className="text-xs font-bold text-cyan-300">{percent.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 소제목 */}
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-semibold text-gray-200">균형잡힌 포트폴리오를 위한 아이디어</h3>
      </div>

      {/* 종목 카드 */}
      <div className="space-y-4">
        {stocks.map((stock, index) => {
          const colors = sectorColors[stock.sector] || sectorColors["기술"];
          const typeInfo = typeLabels[stock.recommendationType];

          return (
            <div
              key={stock.symbol}
              className={`rounded-2xl overflow-hidden border ${colors.border} bg-gradient-to-br ${colors.bg}`}
            >
              {/* 카드 헤더 */}
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-start justify-between gap-2">
                  {/* 순번 + 종목 정보 */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 bg-white/10 border border-white/20">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      {/* 티커 + 유형 뱃지 */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-xl text-white tracking-widest">{stock.symbol}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                      {/* 영어명 */}
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{stock.nameEn}</p>
                      {/* 한글명 */}
                      <p className={`text-xs font-medium mt-0.5 ${colors.accentText}`}>{stock.nameKo}</p>
                    </div>
                  </div>
                  {/* 섹터 뱃지 */}
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${colors.sectorBadge}`}>
                    {stock.sector}
                  </span>
                </div>
              </div>

              {/* 구분선 */}
              <div className="h-px bg-white/10" />

              {/* 기대점 */}
              <div className="px-4 pt-3 pb-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400">기대점</span>
                </div>
                <div className="space-y-2">
                  {(stock.pros || []).map((pro, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <span className="text-xs text-gray-200 leading-relaxed">{pro}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 구분선 */}
              <div className="h-px bg-white/10 mx-4 my-1" />

              {/* 리스크 */}
              <div className="px-4 pt-2 pb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-xs font-semibold text-rose-400">리스크</span>
                </div>
                <div className="space-y-2">
                  {(stock.risks || []).map((risk, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                      <span className="text-xs text-gray-300 leading-relaxed">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 투자 유의사항 */}
      <div className="rounded-2xl border border-amber-800/40 bg-amber-950/30 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <p className="text-xs font-semibold text-amber-300">투자 유의사항</p>
        </div>
        <p className="text-xs text-amber-400/70 leading-relaxed">
          본 아이디어는 포트폴리오 분석 및 설문 응답을 바탕으로 한 참고 자료입니다.
          실제 투자 결정은 본인의 판단과 책임 하에 이루어져야 하며,
          과거 수익률이 미래 수익을 보장하지 않습다.
        </p>
      </div>
    </div>
  );
}