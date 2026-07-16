import { useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { Card } from "@/app/components/ui/layout/card";
import { useLoginActions } from "./landing/useLoginActions";
import { ErrorToast } from "./landing/ErrorToast";
import { LoginButtons } from "./landing/LoginButtons";
import { TUTORIAL_STEPS } from "./landing/TutorialSteps";

// 튜토리얼을 한 번 끝까지 본 사용자는 재방문 시 바로 로그인 화면부터 시작
const SEEN_KEY = "landingTutorialSeen";

const LOGIN_STEP = TUTORIAL_STEPS.length; // 마지막 단계 = 로그인
const TOTAL_STEPS = LOGIN_STEP + 1;

export function LoginPage() {
  const actions = useLoginActions();
  const [step, setStep] = useState(() =>
    localStorage.getItem(SEEN_KEY) ? LOGIN_STEP : 0,
  );

  const goTo = (next: number) => {
    if (next >= LOGIN_STEP) localStorage.setItem(SEEN_KEY, "1");
    setStep(Math.max(0, Math.min(next, LOGIN_STEP)));
  };

  const isLoginStep = step === LOGIN_STEP;

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-screen min-h-dvh flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* 배경 글로우 오브 — 데스크톱 넓은 화면의 허전함을 채우는 장식 */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />
          <div className="absolute -bottom-24 right-1/5 h-80 w-80 rounded-full bg-teal-600/15 blur-3xl" />
        </div>

        <ErrorToast message={actions.errorMessage} onClose={actions.clearError} />

        {/* 상단: 이전 / 진행 도트 / 건너뛰기 */}
        <header className="relative z-10 mx-auto flex h-16 w-full max-w-5xl shrink-0 items-center justify-between px-6">
          <div className="w-20">
            {step > 0 && (
              <button
                onClick={() => goTo(step - 1)}
                className="inline-flex items-center gap-0.5 text-sm text-gray-500 transition-colors hover:text-gray-300"
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </button>
            )}
          </div>
          <div className="flex items-center gap-2" aria-hidden>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-teal-400" : "w-1.5 bg-slate-600"
                }`}
              />
            ))}
          </div>
          <div className="w-20 text-right">
            {!isLoginStep && (
              <button
                onClick={() => goTo(LOGIN_STEP)}
                className="text-sm text-gray-500 transition-colors hover:text-gray-300"
              >
                건너뛰기
              </button>
            )}
          </div>
        </header>

        {/* 단계 콘텐츠 */}
        <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLoginStep ? "login" : TUTORIAL_STEPS[step].key}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className={`w-full ${isLoginStep ? "max-w-md" : "max-w-5xl"}`}
            >
              {isLoginStep ? (
                <div className="space-y-8 text-center">
                  <div>
                    <h2 className="mb-2 text-3xl font-bold text-white md:text-4xl">
                      지금 바로 시작해보세요
                    </h2>
                    <p className="text-gray-400">
                      카카오 계정으로 3초 만에, 부담 없이 손님으로도.
                    </p>
                  </div>
                  <LoginButtons actions={actions} />
                  <Card className="p-3 bg-amber-900/20 border-amber-800/30">
                    <p className="text-xs text-amber-400 text-center leading-relaxed">
                      본 서비스는 투자 참고 목적이며, 실제 투자는 본인의 판단과 책임
                      하에 이루어져야 합니다.
                    </p>
                  </Card>
                </div>
              ) : (
                TUTORIAL_STEPS[step].node
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* 하단: 다음 버튼 (로그인 단계에선 숨김) */}
        {!isLoginStep && (
          <footer className="relative z-10 shrink-0 px-6 pb-10 md:pb-14">
            <button
              onClick={() => goTo(step + 1)}
              className="mx-auto block h-12 w-full max-w-md rounded-md bg-teal-600 text-base font-semibold text-white shadow-lg transition-colors hover:bg-teal-500 md:w-auto md:min-w-64 md:px-16"
            >
              {step === 0 ? "시작하기" : "다음"}
            </button>
          </footer>
        )}
      </div>
    </MotionConfig>
  );
}
