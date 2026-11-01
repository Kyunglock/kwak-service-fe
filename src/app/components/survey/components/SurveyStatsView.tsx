import { ArrowLeft, BarChart3, Users, CheckCircle2, RefreshCcw } from "lucide-react";
import { Card } from "@/app/components/ui/layout/card";
import { Badge } from "@/app/components/ui/feedback/badge";
import { Button } from "@/app/components/ui/form/button";
import type { SurveyStatsDetailResponse } from "@/app/types";

interface Props {
  surveyName: string;
  totalParticipants: number;
  detail: SurveyStatsDetailResponse | null;
  loading: boolean;
  onBack: () => void;
  onEdit: () => void;
}

export function SurveyStatsView({ surveyName, totalParticipants, detail, loading, onBack, onEdit }: Props) {
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        설문 목록으로
      </button>

      <Card className="gap-0 overflow-hidden border-border bg-card p-0 shadow-paper">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-3 border-b border-border bg-accent p-5">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <Badge className="gap-1 rounded-full bg-success/15 text-success px-2 py-0 text-[11px]">
                <CheckCircle2 className="h-3 w-3" /> 완료
              </Badge>
            </div>
            <h2 className="text-lg font-bold leading-snug text-foreground">{surveyName}</h2>
            <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {totalParticipants}명 참여
            </p>
          </div>
          <Button
            size="sm"
            onClick={onEdit}
            className="flex-shrink-0 gap-1.5 bg-primary text-xs font-medium text-primary-foreground hover:bg-primary-strong"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> 설문 다시하기
          </Button>
        </div>

        {/* 본문 */}
        <div className="p-5">
          {loading ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-primary/40 border-t-transparent" />
              <p className="text-sm text-muted-foreground">통계를 불러오는 중...</p>
            </div>
          ) : !detail ? (
            <p className="py-6 text-center text-sm text-faint-foreground">통계를 불러올 수 없습니다.</p>
          ) : (
            <div className="space-y-5">
              {detail.questions.map((question, qIndex) => (
                <div key={question.questionId} className="space-y-3">
                  {/* 질문 */}
                  <div className="flex items-start gap-2.5 rounded-lg bg-card p-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-primary text-[12px] font-bold text-primary-foreground">
                      {qIndex + 1}
                    </span>
                    <h3 className="text-[15px] font-bold leading-relaxed text-foreground">
                      {question.questionText}
                    </h3>
                  </div>

                  {/* 선택지 통계 */}
                  <div className="space-y-2.5 pl-1">
                    {question.options.map((option) => {
                      const pct =
                        totalParticipants === 0
                          ? 0
                          : Math.round((option.selectedCount / totalParticipants) * 100);
                      const isMine = option.optionId === question.selectedOptionId;
                      return (
                        <div key={option.optionId} className="space-y-1.5">
                          <div className="flex items-center justify-between gap-3 text-[13px]">
                            <span
                              className={
                                isMine
                                  ? "flex items-center gap-1 font-semibold text-primary"
                                  : "text-foreground"
                              }
                            >
                              {isMine && <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />}
                              {option.optionText}
                            </span>
                            <span className="flex-shrink-0 tabular-nums font-semibold text-foreground">
                              {pct}%
                              <span className="ml-1 font-normal text-faint-foreground">
                                ({option.selectedCount}명)
                              </span>
                            </span>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isMine ? "bg-primary" : "bg-switch-background"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
