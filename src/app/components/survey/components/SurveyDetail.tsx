import { Card } from "@/app/components/ui/layout/card";
import { Button } from "@/app/components/ui/form/button";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/app/components/ui/form/radio-group";
import { Label } from "@/app/components/ui/form/label";
import { Progress } from "@/app/components/ui/feedback/progress";
import { Badge } from "@/app/components/ui/feedback/badge";
import { ArrowLeft } from "lucide-react";
import type { SurveyDetailResponse } from "@/app/types";

interface SurveyDetailProps {
  surveyDetail: SurveyDetailResponse;
  currentStep: number;
  answers: Record<number, number>;
  originalAnswers: Record<number, number>;
  isEditMode: boolean;
  submitting: boolean;
  onAnswer: (optionId: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onBackToList: () => void;
}

export function SurveyDetail({
  surveyDetail,
  currentStep,
  answers,
  originalAnswers,
  isEditMode,
  submitting,
  onAnswer,
  onNext,
  onPrevious,
  onBackToList,
}: SurveyDetailProps) {
  const currentQuestion = surveyDetail.questions[currentStep];
  if (!currentQuestion) return null;

  const currentAnswer = answers[currentQuestion.questionId];
  const progress = ((currentStep + 1) / surveyDetail.questions.length) * 100;

  return (
    <div className="p-4 space-y-4">
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
        <h2 className="text-lg font-semibold text-foreground flex-1">
          {surveyDetail.surveyName}
        </h2>
        {isEditMode && (
          <Badge className="bg-warning text-primary-foreground text-xs">수정</Badge>
        )}
      </div>

      <div
        className={`border rounded-lg p-3 text-sm ${isEditMode ? "bg-warning/10 border-warning/30 text-warning" : "bg-accent border-primary/40 text-primary"}`}
      >
        <p className="font-medium mb-1">
          {isEditMode ? "응답 수정" : "AI가 생성한 설문"}
        </p>
        <p className="text-xs">
          {isEditMode
            ? "이전 답변을 수정하고 다시 제출할 수 있습니다."
            : surveyDetail.description}
        </p>
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">
              질문 {currentStep + 1} / {surveyDetail.questions.length}
            </span>
            <span className="text-xs font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-4 leading-relaxed text-foreground">
              {currentQuestion.questionText}
            </h3>

            <RadioGroup
              value={currentAnswer ? currentAnswer.toString() : ""}
              onValueChange={(val) => onAnswer(Number(val))}
            >
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = currentAnswer === option.optionId;
                  const isOriginal =
                    isEditMode &&
                    originalAnswers[currentQuestion.questionId] ===
                      option.optionId;

                  return (
                    <div
                      key={option.optionId}
                      className={`flex items-start space-x-3 p-3 rounded-lg border-2 transition-colors ${
                        isSelected
                          ? "border-primary/40 bg-accent"
                          : isOriginal
                            ? "border-warning/40 bg-warning/5"
                            : "border-border bg-muted"
                      }`}
                    >
                      <RadioGroupItem
                        value={option.optionId.toString()}
                        id={`option-${option.optionId}`}
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor={`option-${option.optionId}`}
                        className="flex-1 text-sm cursor-pointer leading-relaxed text-foreground"
                      >
                        <span className="flex items-center gap-2">
                          {option.optionText}
                          {isOriginal && !isSelected && (
                            <span className="text-[10px] text-warning bg-warning/15 px-1.5 py-0.5 rounded">
                              이전 선택
                            </span>
                          )}
                          {isOriginal && isSelected && (
                            <span className="text-[10px] text-primary bg-accent px-1.5 py-0.5 rounded">
                              현재 선택
                            </span>
                          )}
                        </span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        {currentStep > 0 && (
          <Button
            onClick={onPrevious}
            className="flex-1 bg-muted hover:bg-accent text-foreground font-semibold"
          >
            이전
          </Button>
        )}
        <Button
          onClick={onNext}
          disabled={!currentAnswer || submitting}
          className="flex-1 bg-primary hover:bg-primary-strong"
        >
          {submitting
            ? "제출 중..."
            : currentStep === surveyDetail.questions.length - 1
              ? isEditMode
                ? "수정 완료"
                : "완료"
              : "다음"}
        </Button>
      </div>
    </div>
  );
}
