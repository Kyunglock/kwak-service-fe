import { motion } from "motion/react";
import type { ReactNode } from "react";

export interface FeatureItem {
  icon: ReactNode;
  iconBg: string;
  title: string;
  description: string;
  mockup: ReactNode;
}

// reverse=true면 md 이상에서 텍스트/목업 좌우가 뒤집힌다. 모바일은 항상 세로 스택.
export function FeatureShowcase({
  feature,
  reverse,
}: {
  feature: FeatureItem;
  reverse: boolean;
}) {
  return (
    <section className="mx-auto grid max-w-5xl items-center gap-8 px-6 py-16 md:grid-cols-2 md:gap-14">
      <motion.div
        initial={{ opacity: 0, x: reverse ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className={reverse ? "md:order-2" : ""}
      >
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.iconBg}`}>
          {feature.icon}
        </div>
        <h2 className="mb-3 text-2xl font-bold text-white">{feature.title}</h2>
        <p className="leading-relaxed text-gray-400">{feature.description}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className={reverse ? "md:order-1" : ""}
      >
        {feature.mockup}
      </motion.div>
    </section>
  );
}
