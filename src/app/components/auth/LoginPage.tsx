import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { Compass } from "lucide-react";
import { Button } from "@/app/components/ui/form/button";
import { useLoginActions } from "./landing/useLoginActions";
import { ErrorToast } from "./landing/ErrorToast";
import { LoginButtons } from "./landing/LoginButtons";

// throneinvest.ai 스타일의 텍스트 중심 미니멀 스크롤 랜딩.
// 구성: 네비(로고+로그인) → 히어로(헤드라인+CTA 2개) → 신뢰 스트립
//       → 가치 제안 → "기존에는 vs" 비교 3건 → 최종 CTA → 푸터

const TRUST_ITEMS = ["S&P 500 전 종목", "매일 새벽 AI 분석", "16가지 투자 성향"];

// 비교 사례 — 실제 인사이트 탭 기능(성향 적합도·배당 인사이트·선호 섹터 분석) 기준
const USE_CASES = [
  {
    no: "01",
    title: "이 종목, 나랑 맞는 걸까?",
    before: "기존에는 커뮤니티 분위기와 감으로 판단했다면,",
    after: "투자 성향 설문과 보유 종목을 비교해 종목별 적합도를 진단해드려요.",
  },
  {
    no: "02",
    title: "배당은 언제, 얼마나 들어오지?",
    before: "기존에는 종목마다 배당 일정을 하나하나 검색했다면,",
    after: "보유 종목의 배당 데이터를 모아 월별 예상 배당금으로 정리해드려요.",
  },
  {
    no: "03",
    title: "내 포트폴리오, 한쪽에 쏠려 있진 않을까?",
    before: "기존에는 계좌만 봐서는 편중을 눈치채기 어려웠다면,",
    after: "섹터 분석으로 어디에 기울어 있는지 짚고, AI가 매일 새로 읽어드려요.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6 },
} as const;

export function LoginPage() {
  const actions = useLoginActions();
  const shouldReduceMotion = useReducedMotion();

  const scrollToLogin = () => {
    document.getElementById("login-cta")?.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "center",
    });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-slate-900 text-white">
        <ErrorToast message={actions.errorMessage} onClose={actions.clearError} />

        {/* 네비게이션 */}
        <nav className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-900/80 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
            <span className="inline-flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <Compass className="h-4.5 w-4.5 text-white" />
              </span>
              <span className="text-lg font-bold tracking-tight">주식 나침반</span>
            </span>
            <Button
              onClick={scrollToLogin}
              variant="outline"
              size="sm"
              className="border-slate-600 bg-transparent text-slate-200 hover:bg-slate-800"
            >
              로그인
            </Button>
          </div>
        </nav>

        {/* 히어로 */}
        <section className="mx-auto w-full max-w-3xl px-6 pb-24 pt-24 text-center md:pb-32 md:pt-36">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold leading-tight tracking-tight md:text-6xl"
          >
            내 포트폴리오,
            <br />
            AI가 읽어드립니다
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg text-gray-300 md:text-xl"
          >
            보유 종목과 투자 성향으로 답하는 나만의 투자 AI 인사이트
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-3 text-gray-500"
          >
            복잡한 시장 데이터를 내 포트폴리오 기준으로 풀어드려요
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10"
          >
            <LoginButtons actions={actions} row guestLabel="손님으로 미리 보기" />
          </motion.div>
        </section>

        {/* 신뢰 스트립 */}
        <section className="border-y border-slate-800 bg-slate-950/40">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-3 px-6 py-8 text-sm text-gray-400 sm:flex-row sm:gap-12">
            {TRUST_ITEMS.map((item) => (
              <span key={item} className="font-medium tracking-wide">
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* 가치 제안 */}
        <section className="mx-auto w-full max-w-3xl px-6 py-24 text-center md:py-32">
          <motion.h2 {...fadeUp} className="text-3xl font-bold leading-snug tracking-tight md:text-4xl">
            종목 뒤지는 시간은 줄이고,
            <br />
            판단은 더 깊게
          </motion.h2>
          <motion.p {...fadeUp} className="mt-6 text-lg leading-relaxed text-gray-400">
            성향 적합도, 월별 예상 배당금, 섹터 편중까지 — 흩어져 있는 내
            포트폴리오 정보를 AI가 한 번에 정리해드립니다.
          </motion.p>
        </section>

        {/* 기존에는 vs 주식 나침반 */}
        <section className="mx-auto w-full max-w-4xl space-y-6 px-6 pb-24 md:pb-32">
          {USE_CASES.map((useCase) => (
            <motion.div
              key={useCase.title}
              {...fadeUp}
              className="rounded-2xl border border-slate-800 bg-slate-800/40 p-7 md:p-9"
            >
              <p className="mb-3 font-mono text-sm font-semibold tracking-widest text-teal-400">
                {useCase.no}
              </p>
              <h3 className="mb-4 text-xl font-bold tracking-tight md:text-2xl">
                {useCase.title}
              </h3>
              <p className="text-gray-500">{useCase.before}</p>
              <p className="mt-2 text-lg leading-relaxed text-gray-200">
                <span className="font-semibold text-teal-300">주식 나침반에서는</span>{" "}
                {useCase.after}
              </p>
            </motion.div>
          ))}
        </section>

        {/* 최종 CTA */}
        <section id="login-cta" className="border-t border-slate-800 bg-slate-950/40">
          <div className="mx-auto w-full max-w-md px-6 py-24 text-center md:py-32">
            <motion.h2 {...fadeUp} className="text-3xl font-bold leading-snug tracking-tight md:text-4xl">
              나의 투자 여정을
              <br />
              주식 나침반과 함께하세요
            </motion.h2>
            <motion.div {...fadeUp} className="mt-10">
              <LoginButtons actions={actions} />
            </motion.div>
          </div>
        </section>

        {/* 푸터 */}
        <footer className="border-t border-slate-800">
          <div className="mx-auto w-full max-w-4xl space-y-3 px-6 py-10 text-center">
            <p className="text-xs leading-relaxed text-gray-500">
              본 서비스는 투자 참고 목적이며, 실제 투자는 본인의 판단과 책임 하에
              이루어져야 합니다. AI가 생성한 분석에는 오류가 있을 수 있습니다.
            </p>
            <p className="text-xs text-gray-600">© 2026 주식 나침반</p>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
