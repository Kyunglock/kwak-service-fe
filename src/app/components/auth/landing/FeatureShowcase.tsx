import { motion } from "motion/react";
import type { ReactNode } from "react";

export interface FeatureItem {
  icon: ReactNode;
  iconBg: string;
  title: string;
  description: string;
  mockup: ReactNode;
}

// 기능 하나가 화면 하나를 가득 채운다(min-h-screen).
// reverse=true면 md 이상에서 텍스트/목업 좌우가 뒤집힌다. 모바일은 항상 세로 스택.
export function FeatureShowcase({
  feature,
  reverse,
}: {
  feature: FeatureItem;
  reverse: boolean;
}) {
  return (
    <section className="flex min-h-screen items-center px-6 py-16">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-16">
        <motion.div
          initial={{ opacity: 0, x: reverse ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className={reverse ? "md:order-2" : ""}
        >
          <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.iconBg}`}>
            {feature.icon}
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">{feature.title}</h2>
          <p className="text-lg leading-relaxed text-gray-400">{feature.description}</p>
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
      </div>
    </section>
  );
}
