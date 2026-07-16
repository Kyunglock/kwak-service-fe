import { motion } from "motion/react";
import { PieChart, Target, Coins, LayoutGrid } from "lucide-react";

// 핵심 기능 단일 소개 섹션 — 투자자 인사이트(실제 인사이트 탭 구성 그대로:
// 성향 적합도 · 배당 인사이트 · 선호 섹터 분석, 틸 아이덴티티)

const POINTS = [
  {
    icon: <Target className="h-5 w-5 text-teal-300" />,
    title: "성향 적합도",
    desc: "내 투자 성향과 보유 종목이 얼마나 맞는지 종목별로 진단해드려요.",
  },
  {
    icon: <Coins className="h-5 w-5 text-teal-300" />,
    title: "배당 인사이트",
    desc: "월별 예상 배당금까지 계산해 배당 흐름을 미리 보여드려요.",
  },
  {
    icon: <LayoutGrid className="h-5 w-5 text-teal-300" />,
    title: "선호 섹터 분석",
    desc: "내 포트폴리오가 어느 섹터에 기울어 있는지 한눈에 짚어드려요.",
  },
];

const FIT_ROWS = [
  { symbol: "AAPL", fit: 92 },
  { symbol: "NVDA", fit: 68 },
  { symbol: "KO", fit: 85 },
];

const SECTOR_ROWS = [
  { name: "기술", pct: 45 },
  { name: "헬스케어", pct: 22 },
  { name: "금융", pct: 18 },
];

const DIVIDEND_BARS = [35, 20, 55, 20, 40, 70];

export function InsightShowcase() {
  return (
    <section className="flex min-h-screen items-center px-6 py-16">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-16">
        {/* 설명 */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block rounded-full border border-teal-700/60 bg-teal-950/60 px-3 py-1 text-xs font-semibold text-teal-300">
            AI 투자 인사이트
          </span>
          <h2 className="mb-4 mt-5 text-3xl font-bold text-white md:text-4xl">
            내 포트폴리오,
            <br />
            AI가 읽어드립니다
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-gray-400">
            보유 종목, 투자 성향 설문, 배당 데이터를 종합해 AI가 나만의 투자
            인사이트를 만들어드려요.
          </p>
          <ul className="space-y-5">
            {POINTS.map((point, i) => (
              <motion.li
                key={point.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
                className="flex items-start gap-3.5"
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-900/50">
                  {point.icon}
                </span>
                <div>
                  <p className="font-semibold text-white">{point.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-gray-400">{point.desc}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* 인사이트 대시보드 미니어처 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative"
        >
          <div className="absolute -inset-8 rounded-full bg-teal-600/20 blur-3xl" aria-hidden />
          <div className="relative space-y-4 rounded-2xl border border-slate-700 bg-slate-800/80 p-5 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-teal-400" />
              <span className="font-semibold text-gray-100">투자자 인사이트</span>
            </div>

            {/* 종목별 성향 적합도 */}
            <div className="rounded-xl bg-slate-900/60 p-4">
              <p className="mb-3 text-xs font-semibold text-gray-400">종목별 성향 적합도</p>
              <div className="space-y-2.5">
                {FIT_ROWS.map((row, i) => (
                  <div key={row.symbol} className="flex items-center gap-3">
                    <span className="w-12 shrink-0 text-xs font-bold text-white">{row.symbol}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${row.fit}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 + i * 0.15, ease: "easeOut" }}
                      />
                    </div>
                    <span className="w-9 shrink-0 text-right text-xs font-semibold text-teal-300">
                      {row.fit}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 월별 예상 배당금 */}
            <div className="rounded-xl bg-slate-900/60 p-4">
              <p className="mb-3 text-xs font-semibold text-gray-400">월별 예상 배당금</p>
              <div className="flex h-16 items-end gap-2">
                {DIVIDEND_BARS.map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t bg-teal-500/70"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.3 + i * 0.08, ease: "easeOut" }}
                  />
                ))}
              </div>
            </div>

            {/* 선호 섹터 분석 */}
            <div className="rounded-xl bg-slate-900/60 p-4">
              <p className="mb-3 text-xs font-semibold text-gray-400">선호 섹터 분석</p>
              <div className="space-y-2.5">
                {SECTOR_ROWS.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-xs text-gray-400">{s.name}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                      <motion.div
                        className="h-full rounded-full bg-teal-400/80"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.4 + i * 0.15, ease: "easeOut" }}
                      />
                    </div>
                    <span className="w-9 shrink-0 text-right text-xs font-semibold text-gray-300">
                      {s.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
