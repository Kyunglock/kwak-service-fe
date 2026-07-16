import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const shouldReduceMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (shouldReduceMotion) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, shouldReduceMotion]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

const STATS = [
  { to: 500, suffix: "+", label: "S&P 500 분석 종목" },
  { to: 16, suffix: "", label: "투자 MBTI 유형" },
  { to: 365, suffix: "일", label: "매일 새벽 AI 분석" },
];

export function StatsStrip() {
  return (
    <section className="border-y border-slate-800 bg-slate-900/60">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 px-6 py-14 text-center sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <p className="text-4xl font-bold text-white">
              <CountUp to={stat.to} suffix={stat.suffix} />
            </p>
            <p className="mt-2 text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
