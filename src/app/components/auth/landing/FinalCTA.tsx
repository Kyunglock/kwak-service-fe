import { motion } from "motion/react";
import { Card } from "@/app/components/ui/layout/card";
import { LoginButtons } from "./LoginButtons";
import type { LoginActions } from "./useLoginActions";

export function FinalCTA({ actions }: { actions: LoginActions }) {
  return (
    <section className="px-4 pb-10 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className="mx-auto w-full max-w-md space-y-8 text-center"
      >
        <div>
          <h2 className="mb-2 text-3xl font-bold text-white">지금 바로 시작해보세요</h2>
          <p className="text-gray-400">카카오 계정으로 3초 만에, 부담 없이 손님으로도.</p>
        </div>

        <LoginButtons actions={actions} />

        <Card className="p-3 bg-amber-900/20 border-amber-800/30">
          <p className="text-xs text-amber-400 text-center leading-relaxed">
            본 서비스는 투자 참고 목적이며, 실제 투자는 본인의 판단과 책임 하에 이루어져야 합니다.
          </p>
        </Card>
      </motion.div>
    </section>
  );
}
