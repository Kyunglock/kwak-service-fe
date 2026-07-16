import { motion } from "motion/react";

// 랜딩용 CSS/SVG 미니 목업 — 실데이터 아님, 기능 분위기 전달용

// 1. AI 시황 브리핑 — 감성 컬러 카드
export function BriefingMockup() {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
        <span className="text-sm font-semibold text-emerald-300">낙관적 시장</span>
      </div>
      <div className="space-y-2">
        <div className="h-2.5 w-11/12 rounded bg-slate-600/70" />
        <div className="h-2.5 w-full rounded bg-slate-600/50" />
        <div className="h-2.5 w-4/5 rounded bg-slate-600/40" />
      </div>
      <div className="mt-4 flex gap-2">
        <span className="rounded-full bg-emerald-900/50 px-2.5 py-1 text-xs text-emerald-300">S&P +1.2%</span>
        <span className="rounded-full bg-red-900/40 px-2.5 py-1 text-xs text-red-300">금리 우려</span>
      </div>
    </div>
  );
}

// 2. 투자 MBTI — 16유형 뱃지 스태거
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
              ? "border-purple-500 bg-purple-600/40 text-purple-200"
              : "border-slate-700 bg-slate-800/60 text-gray-400"
          }`}
        >
          {type}
        </motion.span>
      ))}
    </motion.div>
  );
}

// 3. 종목운세 — 행운지수 게이지
export function FortuneMockup() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
      <svg viewBox="0 0 200 110" className="w-56 max-w-full">
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
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      </svg>
      <p className="mt-2 text-3xl font-bold text-white">
        78<span className="text-base text-gray-400">점</span>
      </p>
      <p className="text-sm text-gray-400">오늘의 행운지수</p>
    </div>
  );
}

// 4. AI 투자 인사이트 — 말풍선
export function InsightMockup() {
  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-[85%] rounded-2xl rounded-tl-sm border border-slate-700 bg-slate-800/70 p-4 text-sm text-gray-300"
      >
        이번 주 포트폴리오의 기술주 비중이 62%로 높아요. 분산을 위해 배당주를 살펴보는 건 어떨까요?
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="ml-auto max-w-[70%] rounded-2xl rounded-tr-sm bg-blue-600/80 p-4 text-sm text-white"
      >
        배당 성장주 3종목을 추천해드릴게요 📈
      </motion.div>
    </div>
  );
}

// 5. 포트폴리오 — SVG 라인차트 드로잉
export function PortfolioMockup() {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm text-gray-400">총 평가금액</span>
        <span className="text-lg font-bold text-emerald-400">+12.4%</span>
      </div>
      <svg viewBox="0 0 300 120" className="w-full">
        <motion.path
          d="M 0 100 C 40 90, 60 60, 100 70 S 160 40, 200 45 S 260 15, 300 20"
          fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

// 6. 맞춤 종목 추천 — 카드 캐러셀 목업
const RECOMMEND_CARDS = [
  { symbol: "AAPL", name: "애플", change: "+2.1%" },
  { symbol: "MSFT", name: "마이크로소프트", change: "+1.4%" },
  { symbol: "JNJ", name: "존슨앤드존슨", change: "+0.8%" },
];

export function RecommendMockup() {
  return (
    <div className="flex justify-center gap-3">
      {RECOMMEND_CARDS.map((card, i) => (
        <motion.div
          key={card.symbol}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: i === 1 ? -10 : 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: i * 0.15 }}
          className={`w-28 rounded-xl border p-3 text-center ${
            i === 1
              ? "border-blue-500 bg-blue-900/30"
              : "border-slate-700 bg-slate-800/60"
          }`}
        >
          <p className="text-sm font-bold text-white">{card.symbol}</p>
          <p className="mt-0.5 text-xs text-gray-400">{card.name}</p>
          <p className="mt-2 text-xs font-semibold text-emerald-400">{card.change}</p>
        </motion.div>
      ))}
    </div>
  );
}
