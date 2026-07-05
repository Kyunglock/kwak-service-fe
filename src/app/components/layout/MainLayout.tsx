import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/app/contexts/AuthContext";
import { CurrencyProvider } from "@/app/contexts/CurrencyContext";
import { logout as logoutApi } from "@/app/services/authService";
import { logMenuMove } from "@/app/services/menuLogService";
import { getSurveys, getMyResponses } from "@/app/services/surveyService";
import type { SurveyResponse, UserSurveyResponseDto } from "@/app/types";
import { InvestmentSurvey } from "@/app/components/survey/InvestmentSurvey";
import { StockRecommendations } from "@/app/components/market/StockRecommendations";
import { InsightsDashboard } from "@/app/components/market/InsightsDashboard";
import { InvestorTypeDashboard } from "@/app/components/market/InvestorTypeDashboard";
import { ActivityLog } from "@/app/components/activity/ActivityLog";
import { Portfolio } from "@/app/components/portfolio/Portfolio";
import { DividendDashboard } from "@/app/components/portfolio/DividendDashboard";
import { SurveyStatistics } from "@/app/components/survey/SurveyStatistics";
import { GuruPortfolio } from "@/app/components/guru/GuruPortfolio";
import { Tabs, TabsContent } from "@/app/components/ui/layout/tabs";
import { Star, X, Menu, Search } from "lucide-react";
import { Button } from "@/app/components/ui/form/button";
import { useStockPrice } from "@/app/hooks/useStockPrice";
import { MobileAlert } from "@/app/components/ui/feedback/mobile-alert";
import { SideMenu } from "./SideMenu";

export function MainLayout() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoggedIn, logout } = useAuth();
  const [surveyAnswers, setSurveyAnswers] = useState<Record<
    string,
    string
  > | null>(null);
  const activeTab = searchParams.get("tab") ?? "portfolio";
  const setActiveTab = useCallback(
    (tab: string) => {
      if (tab !== activeTab) logMenuMove(tab, activeTab);
      setSearchParams({ tab }, { replace: true });
    },
    [setSearchParams, activeTab],
  );

  // 최초 진입 시 현재 탭 1건 기록
  useEffect(() => {
    logMenuMove(activeTab, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [completedSurveyId, setCompletedSurveyId] = useState<number | null>(null);
  const [incompleteSurveyCount, setIncompleteSurveyCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [surveyInputKeyword, setSurveyInputKeyword] = useState("");
  const [surveyKeyword, setSurveyKeyword] = useState("");
  const [autoOpenSurveyType, setAutoOpenSurveyType] = useState<string | null>(null);

  // 투자 MBTI "시작하기" → 설문 탭 이동 + RISK_PROFILE 설문 자동 오픈
  const goToRiskProfileSurvey = useCallback(() => {
    setSurveyInputKeyword("");
    setSurveyKeyword("");
    setAutoOpenSurveyType("RISK_PROFILE");
    setActiveTab("survey");
  }, [setActiveTab]);

  useEffect(() => {
    const timer = setTimeout(() => setSurveyKeyword(surveyInputKeyword), 500);
    return () => clearTimeout(timer);
  }, [surveyInputKeyword]);

  const { prices: stockPrices, connected: sseConnected } =
    useStockPrice(isLoggedIn);

  const fetchSurveyCounts = useCallback(async () => {
    try {
      const [surveysRes, responsesRes] = await Promise.all([
        getSurveys(),
        getMyResponses(),
      ]);
      const activeSurveys = (surveysRes.data.data ?? []).filter(
        (s: SurveyResponse) => s.useYn !== false,
      );
      const completedIds = new Set(
        (responsesRes.data.data ?? [])
          .filter((r: UserSurveyResponseDto) => r.statusCode === "COMPLETED")
          .map((r: UserSurveyResponseDto) => r.surveyId),
      );
      setIncompleteSurveyCount(
        Math.max(0, activeSurveys.length - completedIds.size),
      );
    } catch {
      // API 실패 시 0 유지
    }
  }, []);

  useEffect(() => {
    // fetchSurveyCounts();
  }, [activeTab, fetchSurveyCounts]);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // 서버 로그아웃 실패해도 로컬은 정리
    }
    logout();
    setSurveyAnswers(null);
    navigate("/login");
  };

  return (
    <CurrencyProvider>
      <MobileAlert />
      <div className="min-h-screen min-h-dvh bg-slate-800 lg:flex">
        {/* 사이드바 (PC: 항상 표시, 모바일: 햄버거 토글) */}
        <SideMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          isLoggedIn={isLoggedIn}
          activeTab={activeTab}
          incompleteSurveyCount={incompleteSurveyCount}
          surveyAnswers={surveyAnswers}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          onNavigateToLogin={() => navigate("/login")}
          onNavigateToAdmin={() => navigate("/admin/login")}
        />

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 모바일 전용 헤더 */}
          <header className="lg:hidden bg-gradient-to-r from-blue-700 to-purple-700 text-white p-4 shadow-lg sticky top-0 z-50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">🧭 주식 나침반</h1>
                <p className="text-xs opacity-90 mt-1">
                  S&amp;P 500 종목 기반 포트폴리오 관리
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:bg-white/20 h-14 w-14 p-0"
              >
                {isMenuOpen ? (
                  <X className="size-7" />
                ) : (
                  <Menu className="size-7" />
                )}
              </Button>
            </div>
          </header>

          {/* 콘텐츠 */}
          <main className="flex-1 p-4 lg:p-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsContent value="portfolio" className="mt-0">
                <Portfolio stockPrices={stockPrices} />
              </TabsContent>

              <TabsContent value="survey" className="mt-0">
                <div className="space-y-4 w-full max-w-4xl mx-auto">
                  {/* 공유 검색창 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={surveyInputKeyword}
                      onChange={(e) => setSurveyInputKeyword(e.target.value)}
                      placeholder="설문 제목 또는 설명 검색"
                      className="w-full pl-9 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-600 transition-colors"
                    />
                  </div>

                  <InvestmentSurvey
                    keyword={surveyKeyword}
                    onComplete={(surveyId) => setCompletedSurveyId(surveyId)}
                    autoOpenType={autoOpenSurveyType}
                    onAutoOpenHandled={() => setAutoOpenSurveyType(null)}
                  />

                  {/* 응답 내역(설문 통계) — 일단 숨김. 필요 시 아래 블록 복원
                  <div className="flex flex-col lg:flex-row lg:gap-5 lg:items-start">
                    <div className="lg:w-3/5">
                      <InvestmentSurvey
                        keyword={surveyKeyword}
                        onComplete={(surveyId) => setCompletedSurveyId(surveyId)}
                        autoOpenType={autoOpenSurveyType}
                        onAutoOpenHandled={() => setAutoOpenSurveyType(null)}
                      />
                    </div>
                    <div className="hidden lg:block w-px bg-slate-700 self-stretch" />
                    <hr className="lg:hidden border-slate-700 my-6" />
                    <div className="lg:w-2/5 lg:sticky lg:top-6">
                      <SurveyStatistics
                        keyword={surveyKeyword}
                        defaultExpandedSurveyId={completedSurveyId}
                        onExpandHandled={() => setCompletedSurveyId(null)}
                      />
                    </div>
                  </div>
                  */}
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="mt-0">
                {surveyAnswers ? (
                  <StockRecommendations />
                ) : (
                  <div className="p-4 text-center py-12">
                    <Star className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-sm text-gray-300">
                      설문을 완료하시면 맞춤형 종목 추천을 받을 수 있습니다.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="insights" className="mt-0">
                <InsightsDashboard />
              </TabsContent>

              <TabsContent value="competition" className="mt-0">
                <div className="w-full max-w-4xl mx-auto">
                  <GuruPortfolio />
                </div>
              </TabsContent>

              <TabsContent value="investor-type" className="mt-0">
                <InvestorTypeDashboard
                  onRetakeSurvey={goToRiskProfileSurvey}
                />
              </TabsContent>

              <TabsContent value="activity" className="mt-0">
                <div className="w-full max-w-4xl mx-auto">
                  <ActivityLog />
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </CurrencyProvider>
  );
}
