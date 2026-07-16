import { motion } from "motion/react";
import { TrendingUp } from "lucide-react";

// 실제 앱 화면의 미니어처 목업 — 각 기능의 실제 컬러 아이덴티티를 그대로 따른다.
// (브리핑=감성 컬러 모달, 놀이터=핑크/앰버/인디고 그라데이션 카드, 인사이트=틸)

// 1. 종목 — 포트폴리오: 보유 종목 수익률 + 수익 곡선
const POSITIONS = [
  { symbol: "AAPL", name: "애플", change: "+2.1%", up: true },
  { symbol: "NVDA", name: "엔비디아", change: "+4.3%", up: true },
  { symbol: "KO", name: "코카콜라", change: "-0.6%", up: false },
];

export function PortfolioMockup() {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5 shadow-2xl backdrop-blur-sm">
      <div className="mb-4 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-gray-300">💼 내 포트폴리오</span>
        <span className="text-lg font-bold text-green-400">+12.4%</span>
      </div>
      <div className="space-y-2">
        {POSITIONS.map((p, i) => (
          <motion.div
            key={p.symbol}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.12 }}
            className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2.5"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-white">{p.symbol}</span>
              <span className="text-xs text-gray-500">{p.name}</span>
            </div>
            <span className={`text-sm font-semibold ${p.up ? "text-green-400" : "text-red-400"}`}>
              {p.change}
            </span>
          </motion.div>
        ))}
      </div>
      <svg viewBox="0 0 300 70" className="mt-4 w-full">
        <motion.path
          d="M 0 60 C 40 55, 60 35, 100 42 S 160 22, 200 26 S 260 6, 300 10"
          fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

// 2. 시황 브리핑 — 실제 MarketBriefingModal의 감성 컬러 헤더(호재=green) 미니어처
export function BriefingMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-600 bg-slate-700 shadow-2xl">
      <div className="flex items-center gap-3 border-b border-green-700/50 bg-gradient-to-r from-green-600/30 via-emerald-600/15 to-transparent px-5 py-3.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/20">
          <TrendingUp className="h-5 w-5 text-green-400" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-gray-100">오늘의 미국 증시</span>
            <span className="rounded border border-green-800 bg-green-950 px-1.5 py-0.5 text-[10px] font-semibold text-green-400">
              호재
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-gray-400">매일 새벽 · AI 요약</p>
        </div>
      </div>
      <div className="space-y-2.5 px-6 py-5">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-sm leading-relaxed text-gray-200"
        >
          S&P 500이 기술주 강세에 힘입어 상승 마감했습니다. 반도체 업종이 지수 상승을 이끌었고…
        </motion.p>
        <div className="h-2.5 w-4/5 rounded bg-slate-600/60" />
        <div className="h-2.5 w-3/5 rounded bg-slate-600/40" />
      </div>
    </div>
  );
}

// 3. 인사이트 — 감성 지수 + 섹터 분석 대시보드 미니어처
const SECTORS = [
  { name: "기술", pct: 45, bar: "bg-teal-400" },
  { name: "헬스케어", pct: 22, bar: "bg-teal-500/80" },
  { name: "금융", pct: 18, bar: "bg-teal-600/70" },
];

export function InsightMockup() {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-800/80 p-5 shadow-2xl backdrop-blur-sm">
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm font-semibold text-teal-300">투자자 감성 지수</span>
          <span className="text-2xl font-bold text-white">62</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-900/80">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
            initial={{ width: 0 }}
            whileInView={{ width: "62%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
      </div>
      <div className="border-t border-slate-700 pt-4">
        <p className="mb-3 text-sm font-semibold text-teal-300">내 포트폴리오 섹터 분석</p>
        <div className="space-y-2.5">
          {SECTORS.map((s, i) => (
            <div key={s.name} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs text-gray-400">{s.name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-900/80">
                <motion.div
                  className={`h-full rounded-full ${s.bar}`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${s.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.15, ease: "easeOut" }}
                />
              </div>
              <span className="w-9 shrink-0 text-right text-xs font-semibold text-gray-300">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 4. 투자 MBTI — 실제 놀이터 카드(핑크/로즈)와 같은 톤, 16유형 뱃지 스태거
const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];
const mbtiGrid = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const mbtiBadge = {
  hidden: { opacity: 0, scale: 0.5 },
  show: { opacity: 1, scale: 1 },
};

export function MbtiMockup() {
  return (
    <div className="rounded-2xl border border-pink-700/40 bg-gradient-to-br from-pink-900/40 to-rose-900/20 p-5 shadow-2xl">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl">🧬</span>
        <span className="text-sm font-semibold text-pink-200">나의 투자 MBTI는?</span>
      </div>
      <motion.div
        variants={mbtiGrid}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        className="grid grid-cols-4 gap-2"
      >
        {MBTI_TYPES.map((type) => (
          <motion.span
            key={type}
            variants={mbtiBadge}
            className={`rounded-lg border py-2.5 text-center text-xs font-semibold ${
              type === "INTJ"
                ? "border-pink-500 bg-pink-600/40 text-pink-100"
                : "border-slate-700 bg-slate-900/50 text-gray-400"
            }`}
          >
            {type}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}

// 5. 종목운세 — 실제 놀이터 카드(앰버/오렌지)와 같은 톤, 행운 게이지
export function FortuneMockup() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-amber-700/40 bg-gradient-to-br from-amber-900/40 to-orange-900/20 p-6 shadow-2xl">
      <div className="mb-2 text-4xl">🔮</div>
      <span className="rounded-full border border-amber-600/60 bg-slate-900/60 px-3 py-1 text-sm font-semibold text-amber-200">
        AAPL
      </span>
      <svg viewBox="0 0 200 110" className="mt-2 w-52 max-w-full">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none" stroke="#334155" strokeWidth="14" strokeLinecap="round"
        />
        <motion.path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none" stroke="url(#fortuneGrad)" strokeWidth="14" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 0.78 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="fortuneGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>
      </svg>
      <p className="text-2xl font-bold text-white">
        오늘의 기운 78<span className="text-base text-gray-400">점</span>
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <span className="rounded-full bg-amber-950/60 px-2.5 py-1 text-xs text-amber-300">✨ 별자리</span>
        <span className="rounded-full bg-amber-950/60 px-2.5 py-1 text-xs text-amber-300">🔢 숫자 궁합</span>
        <span className="rounded-full bg-amber-950/60 px-2.5 py-1 text-xs text-amber-300">🎨 로고 색상</span>
      </div>
    </div>
  );
}

// 6. 투자 대가 — 실제 놀이터 카드(인디고/퍼플)와 같은 톤, 대가 매칭 바
const GURUS = [
  { name: "워런 버핏", match: 82 },
  { name: "레이 달리오", match: 64 },
  { name: "조지 소로스", match: 41 },
];

export function GuruMockup() {
  return (
    <div className="rounded-2xl border border-indigo-700/40 bg-gradient-to-br from-indigo-900/40 to-purple-900/20 p-5 shadow-2xl">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl">👑</span>
        <span className="text-sm font-semibold text-indigo-200">나와 닮은 투자 대가</span>
      </div>
      <div className="space-y-3">
        {GURUS.map((g, i) => (
          <div key={g.name}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-sm text-gray-300">{g.name}</span>
              <span className="text-sm font-bold text-indigo-300">{g.match}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-900/70">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-400"
                initial={{ width: 0 }}
                whileInView={{ width: `${g.match}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
