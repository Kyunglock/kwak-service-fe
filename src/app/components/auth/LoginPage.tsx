import { MotionConfig } from "motion/react";
import { useLoginActions } from "./landing/useLoginActions";
import { ErrorToast } from "./landing/ErrorToast";
import { HeroSection } from "./landing/HeroSection";
import { FeatureShowcase } from "./landing/FeatureShowcase";
import { FEATURES } from "./landing/features";
import { StatsStrip } from "./landing/StatsStrip";
import { FinalCTA } from "./landing/FinalCTA";

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

        <StatsStrip />

        <FinalCTA actions={actions} />
      </div>
    </MotionConfig>
  );
}
