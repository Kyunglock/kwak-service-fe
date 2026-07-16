import { Card } from "@/app/components/ui/layout/card";
import { TrendingUp, Shield, BarChart3 } from "lucide-react";
import { useLoginActions } from "./landing/useLoginActions";
import { LoginButtons } from "./landing/LoginButtons";
import { ErrorToast } from "./landing/ErrorToast";

export function LoginPage() {
  const actions = useLoginActions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <ErrorToast message={actions.errorMessage} onClose={actions.clearError} />

      <div className="max-w-md w-full space-y-8">
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
        <LoginButtons actions={actions} />

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
