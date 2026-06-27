import { Badge } from "@/app/components/ui/feedback/badge";
import { Button } from "@/app/components/ui/form/button";
import {
  Briefcase,
  DollarSign,
  ClipboardList,
  TrendingUp,
  PieChart,
  Crown,
  LogOut,
  LogIn,
  Shield,
  X,
} from "lucide-react";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
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
        className={`fixed inset-0 bg-black/50 z-[60] lg:hidden transition-opacity duration-300 ${
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
          bg-slate-900 shadow-2xl
          flex flex-col
          z-[70] lg:z-auto
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 사이드바 헤더 */}
        <div className="bg-gradient-to-r from-blue-700 to-purple-700 text-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">🧭 주식 나침반</h1>
              <p className="text-xs opacity-90 mt-1">S&amp;P 500 포트폴리오 관리</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-8 w-8 p-0 lg:hidden"
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
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-slate-800"
              }`}
            >
              <Briefcase className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">종목</span>
            </button>

            <button
              onClick={() => handleTabClick("dividend")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "dividend"
                  ? "bg-green-600 text-white"
                  : "text-gray-300 hover:bg-slate-800"
              }`}
            >
              <DollarSign className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">배당금</span>
            </button>

            <button
              onClick={() => handleTabClick("survey")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                activeTab === "survey"
                  ? "bg-cyan-600 text-white"
                  : "text-gray-300 hover:bg-slate-800"
              }`}
            >
              <ClipboardList className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">설문</span>
              {incompleteSurveyCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-auto h-6 w-6 flex items-center justify-center p-0 text-xs bg-red-600 text-white rounded-full"
                >
                  {incompleteSurveyCount}
                </Badge>
              )}
            </button>

            <button
              onClick={() => handleTabClick("statistics")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "statistics"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-slate-800"
              }`}
            >
              <TrendingUp className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">통계</span>
            </button>

            <button
              onClick={() => handleTabClick("insights")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "insights"
                  ? "bg-teal-600 text-white"
                  : "text-gray-300 hover:bg-slate-800"
              }`}
            >
              <PieChart className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">인사이트</span>
            </button>

            <button
              onClick={() => handleTabClick("competition")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "competition"
                  ? "bg-orange-600 text-white"
                  : "text-gray-300 hover:bg-slate-800"
              }`}
            >
              <Crown className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">투자 대가</span>
            </button>
          </div>

          <div className="border-t border-slate-700 my-4"></div>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">로그아웃</span>
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-400 hover:bg-slate-800 hover:text-blue-300 transition-colors"
            >
              <LogIn className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">로그인</span>
            </button>
          )}

          <button
            onClick={handleAdminClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-slate-800 hover:text-indigo-400 transition-colors"
          >
            <Shield className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">관리자</span>
          </button>
        </nav>
      </div>
    </>
  );
}
