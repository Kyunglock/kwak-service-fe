import { Badge } from "@/app/components/ui/feedback/badge";
import { Button } from "@/app/components/ui/form/button";
import {
  Bot,
  Briefcase,
  ClipboardList,
  PieChart,
  Crown,
  Sparkles,
  History,
  LogOut,
  LogIn,
  Shield,
  X,
} from "lucide-react";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  activeTab: string;
  incompleteSurveyCount: number;
  surveyAnswers: Record<string, string> | null;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onNavigateToLogin: () => void;
  onNavigateToAdmin: () => void;
}

export function SideMenu({
  isOpen,
  onClose,
  isLoggedIn,
  isAdmin,
  activeTab,
  incompleteSurveyCount,
  onTabChange,
  onLogout,
  onNavigateToLogin,
  onNavigateToAdmin,
}: SideMenuProps) {
  const handleTabClick = (tab: string) => {
    onTabChange(tab);
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  const handleLogin = () => {
    onNavigateToLogin();
    onClose();
  };

  const handleAdminClick = () => {
    onNavigateToAdmin();
    onClose();
  };

  return (
    <>
      {/* 모바일 배경 오버레이 */}
      <div
        className={`fixed inset-0 bg-[#3B2F26]/30 z-[60] lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* 사이드바 패널 */}
      <div
        className={`
          fixed lg:sticky lg:top-0 lg:h-screen
          inset-y-0 left-0
          w-64 flex-shrink-0
          bg-card border-r border-border shadow-float
          flex flex-col
          z-[70] lg:z-auto
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 사이드바 헤더 */}
        <div className="bg-card border-b border-border text-foreground p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">🧭 주식 나침반</h1>
              <p className="text-xs text-muted-foreground mt-1">S&amp;P 500 포트폴리오 관리</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-foreground hover:bg-accent h-8 w-8 p-0 lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            <button
              onClick={() => handleTabClick("portfolio")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "portfolio"
                  ? "bg-accent text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Briefcase className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">종목</span>
            </button>

            <button
              onClick={() => handleTabClick("assistant")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "assistant"
                  ? "bg-accent text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Bot className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">AI 어시스턴트</span>
            </button>

            <button
              onClick={() => handleTabClick("investor-type")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "investor-type"
                  ? "bg-accent text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Sparkles className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">투자 놀이터</span>
            </button>

            <button
              onClick={() => handleTabClick("insights")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "insights"
                  ? "bg-accent text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <PieChart className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">인사이트</span>
            </button>

            <button
              onClick={() => handleTabClick("survey")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                activeTab === "survey"
                  ? "bg-accent text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <ClipboardList className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">설문/통계</span>
              {incompleteSurveyCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-auto h-6 w-6 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground rounded-full"
                >
                  {incompleteSurveyCount}
                </Badge>
              )}
            </button>

            <button
              onClick={() => handleTabClick("competition")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "competition"
                  ? "bg-accent text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Crown className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">투자 대가</span>
            </button>

            {/* 활동 내역은 관리자 전용 */}
            {isAdmin && (
              <button
                onClick={() => handleTabClick("activity")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "activity"
                    ? "bg-accent text-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <History className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">활동 내역</span>
              </button>
            )}
          </div>

          <div className="border-t border-border my-4"></div>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-accent transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">로그아웃</span>
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-primary hover:bg-accent transition-colors"
            >
              <LogIn className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">로그인</span>
            </button>
          )}

          {/* 관리자 버튼은 관리자 전용 */}
          {isAdmin && (
            <button
              onClick={handleAdminClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">관리자</span>
            </button>
          )}
        </nav>
      </div>
    </>
  );
}
