import { Card } from "@/app/components/ui/layout/card";
import { Button } from "@/app/components/ui/form/button";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/app/components/ui/form/radio-group";
import { Label } from "@/app/components/ui/form/label";
import { Progress } from "@/app/components/ui/feedback/progress";
import { Badge } from "@/app/components/ui/feedback/badge";
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
          className="text-gray-300 hover:text-white -ml-2"
        >
          ← 목록
        </Button>
        <h2 className="text-lg font-semibold text-gray-100 flex-1">
          {surveyDetail.surveyName}
        </h2>
        {isEditMode && (
          <Badge className="bg-amber-600 text-white text-xs">수정</Badge>
        )}
      </div>

      <div
        className={`border rounded-lg p-3 text-sm ${isEditMode ? "bg-amber-950 border-amber-800 text-amber-300" : "bg-cyan-950 border-cyan-800 text-cyan-300"}`}
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

      <Card className="p-4 bg-slate-700 border-slate-600">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-300">
              질문 {currentStep + 1} / {surveyDetail.questions.length}
            </span>
            <span className="text-xs font-medium text-cyan-400">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-4 leading-relaxed text-gray-100">
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
                          ? "border-cyan-500 bg-cyan-950/50"
                          : isOriginal
                            ? "border-amber-600/50 bg-amber-950/20"
                            : "border-slate-600 bg-slate-600/30"
                      }`}
                    >
                      <RadioGroupItem
                        value={option.optionId.toString()}
                        id={`option-${option.optionId}`}
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor={`option-${option.optionId}`}
                        className="flex-1 text-sm cursor-pointer leading-relaxed text-gray-100"
                      >
                        <span className="flex items-center gap-2">
                          {option.optionText}
                          {isOriginal && !isSelected && (
                            <span className="text-[10px] text-amber-400 bg-amber-900/40 px-1.5 py-0.5 rounded">
                              이전 선택
                            </span>
                          )}
                          {isOriginal && isSelected && (
                            <span className="text-[10px] text-cyan-400 bg-cyan-900/40 px-1.5 py-0.5 rounded">
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
            className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold"
          >
            이전
          </Button>
        )}
        <Button
          onClick={onNext}
          disabled={!currentAnswer || submitting}
          className="flex-1 bg-cyan-600 hover:bg-cyan-700"
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
