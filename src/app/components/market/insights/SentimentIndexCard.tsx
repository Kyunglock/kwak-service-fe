import { Activity } from "lucide-react";
import { Card } from "@/app/components/ui/layout/card";
import { Badge } from "@/app/components/ui/feedback/badge";

interface Props {
  score: number;
}

export function SentimentIndexCard({ score }: Props) {
  const label =
    score >= 70 ? "🔥 극도의 탐욕"
    : score >= 60 ? "😊 낙관적"
    : score >= 40 ? "😐 중립"
    : score >= 30 ? "😟 불안"
    : "😱 극도의 공포";

  return (
    <Card className="p-4 bg-card text-foreground border border-border shadow-paper">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-sm">투자 심리 지수</h3>
        </div>
        <Badge className="bg-accent text-primary border-0">실시간</Badge>
      </div>

      <div className="text-center mb-3">
        <div className="text-5xl font-bold mb-1">{score}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>

      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-down via-warning to-up transition-all"
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="flex justify-between text-xs mt-2 text-faint-foreground">
        <span>공포</span>
        <span>탐욕</span>
      </div>
    </Card>
  );
}
