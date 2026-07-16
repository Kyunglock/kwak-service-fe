import { motion } from "motion/react";
import { TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

// 튜토리얼 단계 콘텐츠 — AI 투자 인사이트(실제 인사이트 탭 구성:
// 성향 적합도 · 배당 인사이트 · 선호 섹터 분석)를 한 단계씩 소개한다.
// 각 단계는 AnimatePresence로 remount되므로 mount 애니메이션(animate)을 쓴다.
// 레이아웃: 모바일=목업 위/텍스트 아래(센터), 데스크톱=텍스트 좌/목업 우 2컬럼.

function StepLayout({
  title,
  desc,
  mockup,
}: {
  title: string;
  desc: string;
  mockup: ReactNode;
}) {
  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
      <div className="order-2 text-center md:order-1 md:text-left">
        <span className="inline-block rounded-full border border-teal-700/60 bg-teal-950/60 px-3 py-1 text-xs font-semibold text-teal-300">
          AI 투자 인사이트
        </span>
        <h2 className="mb-4 mt-4 text-2xl font-bold text-white md:text-4xl">{title}</h2>
        <p className="leading-relaxed text-gray-400 md:text-lg">{desc}</p>
      </div>
      <div className="relative order-1 md:order-2">
        <div className="absolute -inset-8 rounded-full bg-teal-600/15 blur-3xl" aria-hidden />
        <div className="relative">{mockup}</div>
      </div>
    </div>
  );
}

function MockupCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-800/80 p-5 text-left shadow-2xl backdrop-blur-sm md:max-w-md md:p-6">
      <p className="mb-4 text-xs font-semibold text-gray-400 md:text-sm">{label}</p>
      {children}
    </div>
  );
}

function IntroStep() {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-2xl md:h-24 md:w-24"
      >
        <TrendingUp className="h-10 w-10 text-white md:h-12 md:w-12" />
      </motion.div>
      <h1 className="mb-5 text-4xl font-bold text-white md:text-6xl">🧭 주식 나침반</h1>
      <p className="text-xl font-semibold text-gray-200 md:text-2xl">
        내 포트폴리오, AI가 읽어드립니다
      </p>
      <p className="mt-3 text-gray-400 md:text-lg">
        보유 종목과 투자 성향을 종합한 나만의 투자 인사이트
      </p>
    </div>
  );
}

const FIT_ROWS = [
  { symbol: "AAPL", fit: 92 },
  { symbol: "NVDA", fit: 68 },
  { symbol: "KO", fit: 85 },
];

function FitStep() {
  return (
    <StepLayout
      title="내 성향에 맞는 종목일까?"
      desc="투자 성향 설문과 보유 종목을 비교해 종목 하나하나의 적합도를 진단해드려요."
      mockup={
        <MockupCard label="종목별 성향 적합도">
          <div className="space-y-3 md:space-y-4">
            {FIT_ROWS.map((row, i) => (
              <div key={row.symbol} className="flex items-center gap-3">
                <span className="w-12 shrink-0 text-sm font-bold text-white md:w-14 md:text-base">
                  {row.symbol}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-900/80 md:h-3">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${row.fit}%` }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: "easeOut" }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-sm font-semibold text-teal-300 md:text-base">
                  {row.fit}%
                </span>
              </div>
            ))}
          </div>
        </MockupCard>
      }
    />
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

function DividendStep() {
  return (
    <StepLayout
      title="배당은 언제, 얼마나 들어올까?"
      desc="보유 종목의 배당 데이터를 모아 월별 예상 배당금 흐름을 미리 보여드려요."
      mockup={
        <MockupCard label="월별 예상 배당금">
          <div className="flex h-28 items-end gap-2.5 md:h-36">
            {DIVIDEND_BARS.map((bar, i) => (
              <div key={bar.month} className="flex h-full flex-1 flex-col justify-end gap-1.5">
                <motion.div
                  className="rounded-t bg-teal-500/80"
                  initial={{ height: 0 }}
                  animate={{ height: `${bar.h}%` }}
                  transition={{ duration: 0.7, delay: 0.3 + i * 0.08, ease: "easeOut" }}
                />
                <span className="text-center text-[10px] text-gray-500 md:text-xs">
                  {bar.month}
                </span>
              </div>
            ))}
          </div>
        </MockupCard>
      }
    />
  );
}

const SECTOR_ROWS = [
  { name: "기술", pct: 45 },
  { name: "헬스케어", pct: 22 },
  { name: "금융", pct: 18 },
];

function SectorStep() {
  return (
    <StepLayout
      title="내 포트폴리오, 어디에 기울어 있을까?"
      desc="섹터 분포를 분석해 편중된 부분을 짚어드려요. AI가 매일 새로 읽어드립니다."
      mockup={
        <MockupCard label="선호 섹터 분석">
          <div className="space-y-3 md:space-y-4">
            {SECTOR_ROWS.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-sm text-gray-300 md:text-base">{s.name}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-900/80 md:h-3">
                  <motion.div
                    className="h-full rounded-full bg-teal-400/80"
                    initial={{ width: 0 }}
                    animate={{ width: `${s.pct}%` }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: "easeOut" }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-sm font-semibold text-gray-300 md:text-base">
                  {s.pct}%
                </span>
              </div>
            ))}
          </div>
        </MockupCard>
      }
    />
  );
}

export const TUTORIAL_STEPS: { key: string; node: ReactNode }[] = [
  { key: "intro", node: <IntroStep /> },
  { key: "fit", node: <FitStep /> },
  { key: "dividend", node: <DividendStep /> },
  { key: "sector", node: <SectorStep /> },
];
