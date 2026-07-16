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
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white antialiased">
        {/* 배경 — 상단 라디얼 글로우 한 겹만, 은은하게 */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(45,212,191,0.10),transparent)]"
          aria-hidden
        />

        <ErrorToast message={actions.errorMessage} onClose={actions.clearError} />

        {/* 네비게이션 */}
        <nav className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/70 backdrop-blur-md">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
            <span className="inline-flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20">
                <Compass className="h-4 w-4 text-white" />
              </span>
              <span className="text-[15px] font-semibold tracking-tight">주식 나침반</span>
            </span>
            <Button
              onClick={scrollToLogin}
              variant="outline"
              size="sm"
              className="rounded-full border-white/15 bg-white/5 px-4 text-slate-200 hover:border-white/30 hover:bg-white/10"
            >
              로그인
            </Button>
          </div>
        </nav>

        {/* 히어로 */}
        <section className="relative mx-auto w-full max-w-3xl px-6 pb-28 pt-24 text-center md:pb-36 md:pt-36">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[13px] font-medium text-gray-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" aria-hidden />
            매일 새벽, AI 포트폴리오 리서치
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[2.75rem] font-bold leading-[1.15] tracking-tight md:text-6xl"
          >
            내 포트폴리오,
            <br />
            <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              AI가 읽어드립니다
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-gray-400 md:text-xl"
          >
            보유 종목과 투자 성향으로 답하는 나만의 투자 AI 인사이트.
            <br className="hidden md:block" />
            복잡한 시장 데이터를 내 포트폴리오 기준으로 풀어드려요.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36 }}
            className="mt-11"
          >
            <LoginButtons actions={actions} row guestLabel="손님으로 미리 보기" />
          </motion.div>
        </section>

        {/* 신뢰 스트립 */}
        <section className="border-y border-white/5 bg-white/[0.02]">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-4 px-6 py-9 sm:flex-row sm:gap-0">
            {TRUST_ITEMS.map((item, i) => (
              <span key={item} className="flex items-center text-sm font-medium tracking-wide text-gray-400">
                {i > 0 && (
                  <span className="mx-8 hidden h-3.5 w-px bg-white/10 sm:block" aria-hidden />
                )}
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* 가치 제안 */}
        <section className="mx-auto w-full max-w-3xl px-6 py-28 text-center md:py-36">
          <motion.p {...fadeUp} className="mb-4 text-sm font-semibold tracking-widest text-teal-400">
            AI 투자 인사이트
          </motion.p>
          <motion.h2 {...fadeUp} className="text-3xl font-bold leading-snug tracking-tight md:text-[2.5rem]">
            종목 뒤지는 시간은 줄이고,
            <br />
            판단은 더 깊게
          </motion.h2>
          <motion.p {...fadeUp} className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-gray-400">
            성향 적합도, 월별 예상 배당금, 섹터 편중까지 — 흩어져 있는 내
            포트폴리오 정보를 AI가 한 번에 정리해드립니다.
          </motion.p>
        </section>

        {/* 기존에는 vs 주식 나침반 — 에디토리얼 넘버링 카드 */}
        <section className="mx-auto w-full max-w-4xl space-y-5 px-6 pb-28 md:pb-36">
          {USE_CASES.map((useCase) => (
            <motion.div
              key={useCase.no}
              {...fadeUp}
              className="group grid gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-7 transition-colors duration-300 hover:border-teal-500/25 md:grid-cols-[5rem_1fr] md:gap-2 md:p-10"
            >
              <p className="font-mono text-lg font-semibold text-white/20 transition-colors duration-300 group-hover:text-teal-400/70">
                {useCase.no}
              </p>
              <div>
                <h3 className="mb-4 text-xl font-bold tracking-tight md:text-2xl">
                  {useCase.title}
                </h3>
                <p className="text-[15px] text-gray-500">{useCase.before}</p>
                <p className="mt-2 text-lg leading-relaxed text-gray-200">
                  <span className="font-semibold text-teal-300">주식 나침반에서는</span>{" "}
                  {useCase.after}
                </p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* 최종 CTA */}
        <section id="login-cta" className="relative border-t border-white/5">
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-[radial-gradient(ellipse_50%_60%_at_50%_110%,rgba(45,212,191,0.08),transparent)]"
            aria-hidden
          />
          <div className="relative mx-auto w-full max-w-md px-6 py-28 text-center md:py-36">
            <motion.h2 {...fadeUp} className="text-3xl font-bold leading-snug tracking-tight md:text-4xl">
              나의 투자 여정을
              <br />
              주식 나침반과 함께하세요
            </motion.h2>
            <motion.div {...fadeUp} className="mt-11">
              <LoginButtons actions={actions} />
            </motion.div>
          </div>
        </section>

        {/* 푸터 */}
        <footer className="border-t border-white/5">
          <div className="mx-auto w-full max-w-4xl space-y-3 px-6 py-12 text-center">
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
