import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { TrendingUp, ChevronDown } from "lucide-react";
import { LoginButtons } from "./LoginButtons";
import { FEATURES } from "./features";
import type { LoginActions } from "./useLoginActions";

export function HeroSection({ actions }: { actions: LoginActions }) {
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  // 스크롤 시 글로우가 콘텐츠보다 느리게 내려가는 패럴랙스
  const glowY = useTransform(scrollY, [0, 800], [0, 200]);

  // 첫 화면의 기능 칩 → 해당 소개 섹션으로 이어서 스크롤
  const scrollToFeature = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-20">
      {/* 배경 글로우 오브 */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={shouldReduceMotion ? undefined : { y: glowY }}
        aria-hidden
      >
        <motion.div
          className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
          animate={shouldReduceMotion ? undefined : { x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl"
          animate={shouldReduceMotion ? undefined : { x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <div className="relative z-10 w-full max-w-xl space-y-8 text-center">
        {/* 로고 스프링 팝인 */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-2xl"
        >
          <TrendingUp className="h-10 w-10 text-white" />
        </motion.div>

        {/* 캐치프레이즈 페이드업 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="mb-3 text-4xl font-bold text-white">🧭 주식 나침반</h1>
          <p className="text-gray-400">
            매일 새벽 AI가 준비하는 나만의 미국 주식 나침반
          </p>
        </motion.div>

        {/* 핵심 기능 칩 — 누르면 해당 소개 섹션으로 이어짐 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <p className="mb-3 text-sm text-gray-500">이런 걸 할 수 있어요 — 눌러서 살펴보세요</p>
          <div className="flex flex-wrap justify-center gap-2">
            {FEATURES.map((feature) => (
              <button
                key={feature.id}
                onClick={() => scrollToFeature(feature.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all hover:scale-105 hover:brightness-125 ${feature.tagClass}`}
              >
                <span aria-hidden>{feature.emoji}</span>
                {feature.shortTitle}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 기존 사용자는 스크롤 없이 바로 로그인 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mx-auto w-full max-w-md"
        >
          <LoginButtons actions={actions} />
        </motion.div>
      </div>

      {/* 스크롤 인디케이터 */}
      <motion.div
        className="absolute bottom-6 text-gray-500"
        animate={shouldReduceMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </section>
  );
}
