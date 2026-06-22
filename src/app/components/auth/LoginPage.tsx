import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/app/components/ui/form/button";
import { Card } from "@/app/components/ui/layout/card";
import { TrendingUp, Shield, BarChart3, AlertCircle, UserRound } from "lucide-react";
import { kakaoLogin, guestLogin } from "@/app/services/authService";
import { useAuth } from "@/app/contexts/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoggedIn, login } = useAuth();
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 에러 메시지 처리
  useEffect(() => {
    const error = searchParams.get('error');

    if (error) {
      const decodedError = decodeURIComponent(error);
      setErrorMessage(decodedError);

      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);

      window.history.replaceState({}, '', window.location.pathname);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // 이미 로그인된 경우 메인으로 리다이렉트
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleKakaoLogin = async () => {
    setIsKakaoLoading(true);
    setErrorMessage(null);

    try {
      const response = await kakaoLogin();
      window.location.href = response.data.data;
    } catch {
      setIsKakaoLoading(false);
      setErrorMessage("로그인 요청에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleGuestLogin = async () => {
    setIsGuestLoading(true);
    setErrorMessage(null);

    try {
      await guestLogin();
      login();
    } catch {
      setIsGuestLoading(false);
      setErrorMessage("손님 로그인에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* 에러 메시지 토스트 */}
        {errorMessage && (
          <Card className="p-4 bg-red-900/30 border-red-700 backdrop-blur-sm animate-in slide-in-from-top">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-200">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </Card>
        )}

        {/* 로고 & 타이틀 */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mb-6 shadow-2xl">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            🧭 주식 나침반
          </h1>
          <p className="text-gray-400 text-sm">
            S&P 500 종목 기반 포트폴리오 관리
          </p>
        </div>

        {/* 주요 기능 소개 */}
        <div className="space-y-3">
          <Card className="p-4 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm mb-1">
                  실시간 시장 분석
                </h3>
                <p className="text-xs text-gray-400">
                  매일 새벽 AI가 미국 시장 핵심 뉴스를 분석하여 투자 인사이트를 전달합니다
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-900/50 rounded-lg flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm mb-1">
                  맞춤형 종목 추천
                </h3>
                <p className="text-xs text-gray-400">
                  나의 투자 성향에 맞는 S&P 500 우량주를 AI가 선별해드립니다
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-900/50 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm mb-1">
                  포트폴리오 관리
                </h3>
                <p className="text-xs text-gray-400">
                  보유 종목의 수익률을 한눈에 파악하고 최적의 포트폴리오를 구성하세요
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* 로그인 버튼 영역 */}
        <div className="space-y-4">
          <Button
            onClick={handleKakaoLogin}
            disabled={isKakaoLoading || isGuestLoading}
            className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] font-semibold text-base shadow-lg disabled:opacity-50"
          >
            {isKakaoLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                <span>로그인 중...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                </svg>
                <span>카카오로 시작하기</span>
              </div>
            )}
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-700"></div>
            <span className="text-xs text-gray-500">또는</span>
            <div className="flex-1 h-px bg-slate-700"></div>
          </div>

          <Button
            onClick={handleGuestLogin}
            disabled={isKakaoLoading || isGuestLoading}
            variant="outline"
            className="w-full h-12 border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700 font-semibold text-base"
          >
            {isGuestLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-slate-400/20 border-t-slate-300 rounded-full animate-spin"></div>
                <span>로그인 중...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <UserRound className="w-5 h-5" />
                <span>손님으로 시작하기</span>
              </div>
            )}
          </Button>
        </div>

        {/* 하단 안내 */}
        <div className="pt-4">
          <Card className="p-3 bg-amber-900/20 border-amber-800/30">
            <p className="text-xs text-amber-400 text-center leading-relaxed">
              본 서비스는 투자 참고 목적이며, 실제 투자는 본인의 판단과 책임 하에 이루어져야 합니다.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
