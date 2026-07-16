import { MotionConfig } from "motion/react";
import { Card } from "@/app/components/ui/layout/card";
import { useLoginActions } from "./landing/useLoginActions";
import { ErrorToast } from "./landing/ErrorToast";
import { HeroSection } from "./landing/HeroSection";
import { FeatureShowcase } from "./landing/FeatureShowcase";
import { FEATURES } from "./landing/features";

export function LoginPage() {
  const actions = useLoginActions();

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <ErrorToast message={actions.errorMessage} onClose={actions.clearError} />

        <HeroSection actions={actions} />

        <div className="py-8">
          {FEATURES.map((feature, i) => (
            <FeatureShowcase key={feature.title} feature={feature} reverse={i % 2 === 1} />
          ))}
        </div>

        {/* 임시 푸터 — Task 5에서 FinalCTA로 대체 */}
        <div className="mx-auto max-w-md px-4 pb-8">
          <Card className="p-3 bg-amber-900/20 border-amber-800/30">
            <p className="text-xs text-amber-400 text-center leading-relaxed">
              본 서비스는 투자 참고 목적이며, 실제 투자는 본인의 판단과 책임 하에 이루어져야 합니다.
            </p>
          </Card>
        </div>
      </div>
    </MotionConfig>
  );
}
