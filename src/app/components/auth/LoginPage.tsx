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

// 스크롤을 내리면 하나씩 나타나는 AI 투자 인사이트 설명 블록 (문구 + 미니 비주얼)
// 실제 인사이트 탭 기능 기준: 성향 적합도 · 배당 인사이트 · 선호 섹터 분석
const FIT_ROWS = [
  { symbol: "AAPL", fit: 92 },
  { symbol: "NVDA", fit: 68 },
  { symbol: "KO", fit: 85 },
];

function FitVisual() {
  return (
    <VisualCard label="종목별 성향 적합도">
      <div className="space-y-4">
        {FIT_ROWS.map((row, i) => (
          <div key={row.symbol} className="flex items-center gap-4">
            <span className="w-14 shrink-0 text-sm font-bold text-white">{row.symbol}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
                initial={{ width: 0 }}
                whileInView={{ width: `${row.fit}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 + i * 0.15, ease: "easeOut" }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-sm font-semibold text-teal-300">
              {row.fit}%
            </span>
          </div>
        ))}
      </div>
    </VisualCard>
  );
}

const DIVIDEND_BARS = [
  { month: "1월", h: 35 },
  { month: "2월", h: 20 },
  { month: "3월", h: 55 },
  { month: "4월", h: 20 },
  { month: "5월", h: 40 },
  { month: "6월", h: 70 },
];

function DividendVisual() {
  return (
    <VisualCard label="월별 예상 배당금">
      <div className="flex h-32 items-end gap-3">
        {DIVIDEND_BARS.map((bar, i) => (
          <div key={bar.month} className="flex h-full flex-1 flex-col justify-end gap-2">
            <motion.div
              className="rounded-t-md bg-gradient-to-t from-teal-600/70 to-teal-400/80"
              initial={{ height: 0 }}
              whileInView={{ height: `${bar.h}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.08, ease: "easeOut" }}
            />
            <span className="text-center text-[11px] text-gray-500">{bar.month}</span>
          </div>
        ))}
      </div>
    </VisualCard>
  );
}

const SECTOR_ROWS = [
  { name: "기술", pct: 45 },
  { name: "헬스케어", pct: 22 },
  { name: "금융", pct: 18 },
];

function SectorVisual() {
  return (
    <VisualCard label="선호 섹터 분석">
      <div className="space-y-4">
        {SECTOR_ROWS.map((s, i) => (
          <div key={s.name} className="flex items-center gap-4">
            <span className="w-16 shrink-0 text-sm text-gray-300">{s.name}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full bg-teal-400/80"
                initial={{ width: 0 }}
                whileInView={{ width: `${s.pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 + i * 0.15, ease: "easeOut" }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-sm font-semibold text-gray-300">
              {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </VisualCard>
  );
}

function VisualCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute -inset-10 rounded-full bg-teal-500/[0.07] blur-3xl" aria-hidden />
      <div className="relative mx-auto w-full max-w-md rounded-2xl border border-white/5 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-sm md:p-7">
        <p className="mb-5 text-[13px] font-semibold tracking-wide text-gray-400">{label}</p>
        {children}
      </div>
    </div>
  );
}

const INSIGHT_FEATURES = [
  {
    lead: "내 성향에 맞는 종목인지,",
    accent: "종목별로 진단해요",
    sub: "투자 성향 설문과 보유 종목을 비교한 성향 적합도",
    visual: <FitVisual />,
  },
  {
    lead: "배당이 언제, 얼마나 들어오는지,",
    accent: "월별로 정리해요",
    sub: "보유 종목의 배당 데이터를 모은 월별 예상 배당금",
    visual: <DividendVisual />,
  },
  {
    lead: "포트폴리오가 어디에 기울었는지,",
    accent: "한눈에 짚어드려요",
    sub: "섹터 분석으로 보는 내 계좌의 편중과 분산",
    visual: <SectorVisual />,
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

        {/* 히어로 — 첫 화면을 꽉 채워 아래 섹션은 스크롤 전엔 보이지 않는다 (네비 h-16 제외) */}
        <section className="relative mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[13px] font-medium text-gray-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" aria-hidden />
            매일 새벽 업데이트
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
            보유 종목과 투자 성향으로 답하는 나만의 투자 AI
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

        {/* 가치 제안 — 인사이트 설명 시퀀스의 인트로 */}
        <section className="mx-auto w-full max-w-3xl px-6 pt-28 text-center md:pt-36">
          <motion.p {...fadeUp} className="mb-4 text-sm font-semibold tracking-widest text-teal-400">
            AI 투자 인사이트
          </motion.p>
          <motion.h2 {...fadeUp} className="text-3xl font-bold leading-snug tracking-tight md:text-[2.5rem]">
            종목 뒤지는 시간은 줄이고,
            <br />
            판단은 더 깊게
          </motion.h2>
        </section>

        {/* AI 투자 인사이트 설명 — 문구 + 미니 비주얼, 좌우 교차로 하나씩 떠오른다 */}
        <section className="mx-auto w-full max-w-5xl px-6 pb-10 md:pb-16">
          {INSIGHT_FEATURES.map((feature, i) => {
            const reverse = i % 2 === 1;
            return (
              <div
                key={feature.accent}
                className="grid items-center gap-10 py-16 md:grid-cols-2 md:gap-20 md:py-24"
              >
                <motion.div
                  initial={{ opacity: 0, x: reverse ? 32 : -32 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6 }}
                  className={`text-center md:text-left ${reverse ? "md:order-2" : ""}`}
                >
                  <h3 className="text-2xl font-bold leading-snug tracking-tight md:text-4xl">
                    {feature.lead}
                    <br />
                    <span className="bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">
                      {feature.accent}
                    </span>
                  </h3>
                  <p className="mt-5 text-base text-gray-500 md:text-lg">{feature.sub}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className={reverse ? "md:order-1" : ""}
                >
                  {feature.visual}
                </motion.div>
              </div>
            );
          })}

          {/* 마무리 문구 — 센터 단독 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7 }}
            className="py-20 text-center md:py-28"
          >
            <h3 className="text-2xl font-bold leading-snug tracking-tight md:text-4xl">
              그리고 매일 새벽,
              <br />
              <span className="bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">
                AI가 다시 읽습니다
              </span>
            </h3>
            <p className="mt-5 text-base text-gray-500 md:text-lg">
              장 마감 후 데이터로 매일 새로 생성되는 인사이트
            </p>
          </motion.div>
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
