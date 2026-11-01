import { Card } from "@/app/components/ui/layout/card";
import { Button } from "@/app/components/ui/form/button";
import { Badge } from "@/app/components/ui/feedback/badge";
import { Users, CheckCircle2, ArrowLeft } from "lucide-react";
import type { SurveyStatsDetailResponse } from "@/app/types";

interface SurveyResultProps {
  statsLoading: boolean;
  surveyStatsDetail: SurveyStatsDetailResponse | null;
  onBackToList: () => void;
}

export function SurveyResult({ statsLoading, surveyStatsDetail, onBackToList }: SurveyResultProps) {
  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToList}
            className="gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground hover:border-border hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            목록
          </Button>
          <h2 className="text-lg font-semibold text-foreground flex-1">설문 결과</h2>
        </div>
        <Card className="p-8 text-center bg-card border-border">
          <div className="w-8 h-8 border-2 border-primary/40 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">결과를 불러오는 중...</p>
        </Card>
      </div>
    );
  }

  if (!surveyStatsDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToList}
            className="gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground hover:border-border hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            목록
          </Button>
          <h2 className="text-lg font-semibold text-foreground flex-1">설문 결과</h2>
        </div>
        <Card className="p-4 bg-success/10 border-success/40 text-center">
          <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-2" />
          <p className="text-sm text-foreground font-semibold">설문이 완료되었습니다!</p>
          <p className="text-xs text-muted-foreground mt-1">통계 데이터를 불러올 수 없습니다.</p>
        </Card>
        <Button onClick={onBackToList} className="w-full bg-muted hover:bg-accent text-foreground">
          설문 목록으로
        </Button>
      </div>
    );
  }

  const totalParticipants = surveyStatsDetail.questions[0]?.options.reduce(
    (sum, o) => sum + o.selectedCount, 0
  ) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={onBackToList} className="text-muted-foreground hover:text-foreground -ml-2">
          ← 목록
        </Button>
        <h2 className="text-lg font-semibold text-foreground flex-1">설문 결과</h2>
      </div>

      {/* 완료 안내 */}
      <Card className="p-4 bg-success/10 border border-success/30 text-foreground">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 flex-shrink-0 text-success" />
          <div>
            <p className="font-semibold text-sm">설문이 완료되었습니다!</p>
            <p className="text-xs text-muted-foreground mt-0.5">다른 참여자들의 응답과 비교해보세요.</p>
          </div>
        </div>
      </Card>

      {/* 참여자 수 */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card rounded-lg px-3 py-2 border border-border">
        <Users className="w-4 h-4 text-primary" />
        <span>총 <span className="font-semibold text-foreground">{totalParticipants}명</span> 참여</span>
      </div>

      {/* 질문별 결과 */}
      <div className="space-y-3">
        {surveyStatsDetail.questions.map((question, qIndex) => {
          const qTotal = question.options.reduce((sum, o) => sum + o.selectedCount, 0);
          return (
            <Card key={question.questionId} className="bg-card border-border p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Badge className="bg-primary text-primary-foreground text-xs mt-0.5 flex-shrink-0">
                  Q{qIndex + 1}
                </Badge>
                <h4 className="text-sm font-semibold text-foreground leading-relaxed">
                  {question.questionText}
                </h4>
              </div>

              <div className="space-y-2">
                {question.options.map((option) => {
                  const pct = qTotal === 0 ? 0 : Math.round((option.selectedCount / qTotal) * 100);
                  const isMyAnswer = option.optionId === question.selectedOptionId;
                  return (
                    <div key={option.optionId} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={isMyAnswer ? "font-bold text-primary flex items-center gap-1" : "text-muted-foreground"}>
                          {isMyAnswer && <CheckCircle2 className="w-3 h-3" />}
                          {option.optionText}
                        </span>
                        <span className="text-muted-foreground">{option.selectedCount}명 ({pct}%)</span>
                      </div>
                      <div className="relative h-7 bg-muted rounded-lg overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                            isMyAnswer
                              ? "bg-primary"
                              : "bg-switch-background"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-xs font-semibold ${pct > 20 ? "text-foreground" : "text-muted-foreground"}`}>
                            {pct}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <Button onClick={onBackToList} className="w-full bg-muted hover:bg-accent text-foreground">
        설문 목록으로
      </Button>
    </div>
  );
}
