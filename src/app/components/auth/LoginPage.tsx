import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { Compass, TrendingUp, Dna, Crown, Sparkles } from "lucide-react";
import { Button } from "@/app/components/ui/form/button";
import { useLoginActions } from "./landing/useLoginActions";
import { ErrorToast } from "./landing/ErrorToast";
import { LoginButtons } from "./landing/LoginButtons";
import { THEME } from "@/app/theme/tokens";
import { PLAYGROUND_TONES } from "@/app/theme/featurePalettes";

// throneinvest.ai 스타일의 텍스트 중심 미니멀 스크롤 랜딩.
// 구성: 네비(로고+로그인) → 히어로(헤드라인+CTA 2개) → 신뢰 스트립
//       → 가치 제안 → "기존에는 vs" 비교 3건 → 최종 CTA → 푸터

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
            <span className="w-14 shrink-0 text-sm font-bold text-foreground">{row.symbol}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                whileInView={{ width: `${row.fit}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 + i * 0.15, ease: "easeOut" }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-sm font-semibold text-primary">
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
              className="rounded-t-md bg-primary/80"
              initial={{ height: 0 }}
              whileInView={{ height: `${bar.h}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.08, ease: "easeOut" }}
            />
            <span className="text-center text-[11px] text-faint-foreground">{bar.month}</span>
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
            <span className="w-16 shrink-0 text-sm text-muted-foreground">{s.name}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary/70"
                initial={{ width: 0 }}
                whileInView={{ width: `${s.pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 + i * 0.15, ease: "easeOut" }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-sm font-semibold text-muted-foreground">
              {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </VisualCard>
  );
}

// 문구 + 미니 비주얼 좌우 교차 블록 (인사이트·종목 섹션 공용)
function FeatureBlock({
  lead,
  accent,
  sub,
  visual,
  reverse,
}: {
  lead: string;
  accent: string;
  sub: string;
  visual: React.ReactNode;
  reverse: boolean;
}) {
  return (
    <div className="grid items-center gap-10 py-16 md:grid-cols-2 md:gap-20 md:py-24">
      <motion.div
        initial={{ opacity: 0, x: reverse ? 32 : -32 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className={`text-center md:text-left ${reverse ? "md:order-2" : ""}`}
      >
        <h3 className="text-2xl font-bold leading-snug tracking-tight md:text-4xl">
          {lead}
          <br />
          <span className="text-primary">
            {accent}
          </span>
        </h3>
        <p className="mt-5 text-base text-muted-foreground md:text-lg">{sub}</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className={reverse ? "md:order-1" : ""}
      >
        {visual}
      </motion.div>
    </div>
  );
}

function VisualCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="relative mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-paper md:p-7">
        <p className="mb-5 text-[13px] font-semibold tracking-wide text-muted-foreground">{label}</p>
        {children}
      </div>
    </div>
  );
}

// 종목 탭 소개 비주얼 — 시황 브리핑(실제 MarketBriefingModal의 감성 컬러 헤더) 미니어처
function BriefingVisual() {
  return (
    <div className="relative">
      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-paper">
        <div className="flex items-center gap-3 border-b border-up/20 bg-up/10 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-up/15">
            <TrendingUp className="h-4.5 w-4.5 text-up" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">오늘의 미국 증시</span>
              <span className="rounded border border-up/30 bg-up/10 px-1.5 py-0.5 text-[10px] font-semibold text-up">
                호재
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-faint-foreground">매일 새벽 · AI 요약</p>
          </div>
        </div>
        <div className="space-y-2.5 px-5 py-5">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm leading-relaxed text-muted-foreground"
          >
            S&P 500이 기술주 강세에 힘입어 상승 마감했습니다. 반도체 업종이 지수
            상승을 이끌었고…
          </motion.p>
          <div className="h-2 w-4/5 rounded bg-muted" />
          <div className="h-2 w-3/5 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

// 종목 탭 소개 비주얼 — 포트폴리오 현황(수익률 + 수익 곡선) 미니어처
const POSITIONS = [
  { symbol: "AAPL", name: "애플", change: "+2.1%", up: true },
  { symbol: "NVDA", name: "엔비디아", change: "+4.3%", up: true },
  { symbol: "KO", name: "코카콜라", change: "-0.6%", up: false },
];

function PortfolioVisual() {
  return (
    <VisualCard label="내 포트폴리오">
      <div className="space-y-2">
        {POSITIONS.map((p, i) => (
          <motion.div
            key={p.symbol}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
            className="flex items-center justify-between rounded-lg bg-muted px-3.5 py-2.5"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-foreground">{p.symbol}</span>
              <span className="text-xs text-faint-foreground">{p.name}</span>
            </div>
            <span
              className={`text-sm font-semibold ${p.up ? "text-up" : "text-down"}`}
            >
              {p.change}
            </span>
          </motion.div>
        ))}
      </div>
      <svg viewBox="0 0 300 64" className="mt-4 w-full">
        <motion.path
          d="M 0 56 C 40 52, 60 34, 100 40 S 160 22, 200 26 S 260 6, 300 10"
          fill="none"
          stroke={THEME.up}
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
      </svg>
    </VisualCard>
  );
}

// 종목 탭 소개 블록 (실제 종목 탭: 시황 브리핑 모달 + 포트폴리오 현황)
const STOCK_FEATURES = [
  {
    lead: "오늘의 미국 증시,",
    accent: "AI가 요약해드려요",
    sub: "호재·악재·보합을 컬러로 구분하는 매일 새벽 시황 브리핑",
    visual: <BriefingVisual />,
  },
  {
    lead: "보유 종목 현황은,",
    accent: "대시보드 한 화면에",
    sub: "수익률과 실시간 시세, 매매 기록까지 한눈에 보는 포트폴리오",
    visual: <PortfolioVisual />,
  },
];

// 투자 놀이터 소개 — 실제 놀이터 카드 3종(인앱 카피 그대로)
const PLAYGROUND_ITEMS = [
  {
    icon: <Dna className="h-5 w-5" />,
    title: "투자 MBTI 알아보기!",
    desc: "44문항 통합 설문으로 성격 MBTI와 나의 투자 스타일을 함께 찾아보세요.",
  },
  {
    icon: <Crown className="h-5 w-5" />,
    title: "내 포트폴리오와 맞는 투자 대가는?",
    desc: "워런 버핏, 조지 소로스 등 전설적 투자자들의 포트폴리오와 비교해보세요.",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "오늘의 종목운세",
    desc: "궁금한 종목의 오늘 기운을 점쳐보세요. 별자리부터 로고 색상까지, 재미용 운세예요.",
  },
];

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
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground antialiased">

        <ErrorToast message={actions.errorMessage} onClose={actions.clearError} />

        {/* 네비게이션 */}
        <nav className="sticky top-0 z-40 border-b border-border bg-background/95">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
            <span className="inline-flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-paper">
                <Compass className="h-4 w-4 text-primary-foreground" />
              </span>
              <span className="text-[15px] font-semibold tracking-tight">주식 나침반</span>
            </span>
            <Button
              onClick={scrollToLogin}
              variant="outline"
              size="sm"
              className="rounded-full border-border bg-card px-4 text-foreground hover:border-primary/40 hover:bg-accent"
            >
              로그인
            </Button>
          </div>
        </nav>

        {/* 히어로 — 첫 화면을 꽉 채워 아래 섹션은 스크롤 전엔 보이지 않는다 (네비 h-16 제외) */}
        <section className="relative mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-5xl flex-col items-center justify-center px-6 py-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-[13px] font-medium text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
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
            <span className="text-primary">
              AI가 읽어드립니다
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            보유 종목과 투자 성향으로 답하는 나만의 투자 AI
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36 }}
            className="relative mt-11"
          >
            <LoginButtons actions={actions} row guestLabel="손님으로 미리 보기" />
          </motion.div>
        </section>

        {/* 가치 제안 — 인사이트 설명 시퀀스의 인트로 */}
        <section className="mx-auto w-full max-w-3xl px-6 pt-28 text-center md:pt-36">
          <motion.p {...fadeUp} className="mb-4 text-sm font-semibold tracking-widest text-primary">
            AI 투자 인사이트
          </motion.p>
          <motion.h2 {...fadeUp} className="text-3xl font-bold leading-snug tracking-tight md:text-[2.5rem]">
            정보 찾는 시간은 줄이고,
            <br />
            판단은 더 깊게
          </motion.h2>
        </section>

        {/* AI 투자 인사이트 설명 — 문구 + 미니 비주얼, 좌우 교차로 하나씩 떠오른다 */}
        <section className="mx-auto w-full max-w-5xl px-6 pb-10 md:pb-16">
          {INSIGHT_FEATURES.map((feature, i) => (
            <FeatureBlock key={feature.accent} {...feature} reverse={i % 2 === 1} />
          ))}
        </section>

        {/* 종목 탭 — 시황 브리핑 AI 요약 + 포트폴리오 현황 대시보드 */}
        <section className="mx-auto w-full max-w-5xl px-6 pb-10 md:pb-16">
          <div className="pt-16 text-center md:pt-24">
            <motion.p {...fadeUp} className="mb-4 text-sm font-semibold tracking-widest text-primary">
              종목 대시보드
            </motion.p>
            <motion.h2 {...fadeUp} className="text-3xl font-bold leading-snug tracking-tight md:text-[2.5rem]">
              시황부터 내 계좌까지, 한눈에
            </motion.h2>
          </div>
          {STOCK_FEATURES.map((feature, i) => (
            <FeatureBlock key={feature.accent} {...feature} reverse={i % 2 === 0} />
          ))}
        </section>

        {/* 투자 놀이터 — 투자 MBTI · 투자 대가 매치 · 종목운세 */}
        <section className="mx-auto w-full max-w-5xl px-6 pb-16 md:pb-24">
          <div className="pt-16 pb-14 text-center md:pt-24">
            <motion.p {...fadeUp} className="mb-4 text-sm font-semibold tracking-widest text-primary">
              투자 놀이터
            </motion.p>
            <motion.h2 {...fadeUp} className="text-3xl font-bold leading-snug tracking-tight md:text-[2.5rem]">
              분석 사이사이,
              <br />
              가볍게 즐길 것들
            </motion.h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {PLAYGROUND_ITEMS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className={`rounded-2xl border border-border bg-card p-7 shadow-paper transition-colors duration-300 ${PLAYGROUND_TONES[item.title].hover}`}
              >
                <span className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${PLAYGROUND_TONES[item.title].iconBg} ${PLAYGROUND_TONES[item.title].icon}`}>
                  {item.icon}
                </span>
                <h3 className="mb-2.5 text-lg font-bold tracking-tight">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-6">
          {/* 마무리 문구 + 최종 로그인 CTA */}
          <motion.div
            id="login-cta"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7 }}
            className="relative py-24 text-center md:py-32"
          >
            <div className="relative">
              <h3 className="text-2xl font-bold leading-snug tracking-tight md:text-4xl">
                당신이 잠든 사이,
                <br />
                <span className="text-primary">
                  AI는 일합니다
                </span>
              </h3>
              <p className="mt-5 text-base text-muted-foreground md:text-lg">
                매일 새벽, 장 마감 데이터로 오늘의 인사이트를 미리 준비해둬요
              </p>
              <div className="mx-auto mt-11 w-full max-w-md">
                <LoginButtons actions={actions} />
              </div>
            </div>
          </motion.div>
        </section>

        {/* 푸터 */}
        <footer className="border-t border-border">
          <div className="mx-auto w-full max-w-4xl space-y-3 px-6 py-12 text-center">
            <p className="text-xs leading-relaxed text-faint-foreground">
              본 서비스는 투자 참고 목적이며, 실제 투자는 본인의 판단과 책임 하에
              이루어져야 합니다. AI가 생성한 분석에는 오류가 있을 수 있습니다.
            </p>
            <p className="text-xs text-faint-foreground">© 2026 주식 나침반</p>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
