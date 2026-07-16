import { MotionConfig } from "motion/react";
import { useLoginActions } from "./landing/useLoginActions";
import { ErrorToast } from "./landing/ErrorToast";
import { HeroSection } from "./landing/HeroSection";
import { InsightShowcase } from "./landing/InsightShowcase";
import { FinalCTA } from "./landing/FinalCTA";

export function LoginPage() {
  const actions = useLoginActions();

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <ErrorToast message={actions.errorMessage} onClose={actions.clearError} />

        <HeroSection actions={actions} />

        <InsightShowcase />

        <FinalCTA actions={actions} />
      </div>
    </MotionConfig>
  );
}
