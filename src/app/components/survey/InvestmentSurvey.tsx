import { useState, useEffect, useCallback } from "react";
import { Card } from "@/app/components/ui/layout/card";
import type {
  SurveyDetailResponse,
  UserSurveyResponseDto,
  SurveySubmitRequest,
  SurveyAnswerResponse,
  SurveyWithMyResponse,
} from "@/app/types";
import {
  getSurvey,
  submitSurvey,
  getMySurveyResponse,
  getSurveyWithMyResponses,
} from "@/app/services/surveyService";
import { SurveyList } from "./components/SurveyList";
import { SurveyDetail } from "./components/SurveyDetail";

interface SurveyProps {
  onComplete: (surveyId: number) => void;
}

export function InvestmentSurvey({ onComplete }: SurveyProps) {
  const [mySurveyResponses, setMySurveyResponses] = useState<UserSurveyResponseDto>();
  const [surveyWithMyResponses, setSurveyWithMyResponses] = useState<SurveyWithMyResponse[]>([]);
  const [surveyDetail, setSurveyDetail] = useState<SurveyDetailResponse | null>(null);
  const [view, setView] = useState<"list" | "detail">("list");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [originalAnswers, setOriginalAnswers] = useState<Record<number, number>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 설문 목록 로드
  const fetchSurveyWithMyResponses = useCallback(async () => {
    try {
      const res = await getSurveyWithMyResponses();
      setSurveyWithMyResponses(res.data.data ?? []);
    } catch {
      // apiClient 인터셉터에서 에러 처리됨
    }
  }, []);

  const fetchMySurveyResponse = useCallback(async (surveyId: number, responseId: number) => {
    try {
      const res = await getMySurveyResponse(surveyId, responseId);
      const data = res.data.data ?? [];
      setMySurveyResponses(data);
      return data;
    } catch {
      // apiClient 인터셉터에서 에러 처리됨
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    const init = async () => {
      setListLoading(true);
      await fetchSurveyWithMyResponses();
      setListLoading(false);
    };
    init();
  }, [fetchSurveyWithMyResponses]);

  // 완료된 설문 ID 집합
  const completedSurveyIds = new Set(
    surveyWithMyResponses.filter((r) => r.statusCode === "COMPLETED").map((r) => r.surveyId)
  );

  const incompleteSurveys = surveyWithMyResponses.filter((s) => !completedSurveyIds.has(s.surveyId));
  const incompleteCount = incompleteSurveys.length;

  // 설문 선택 → 완료 설문은 수정 화면, 미완료는 응답 화면
  const handleSelectSurvey = async (survey: SurveyWithMyResponse) => {
    const isCompleted = completedSurveyIds.has(survey.surveyId);
    setDetailLoading(true);

    try {
      if (survey.responseId) {
        const prevResponse = await fetchMySurveyResponse(survey.surveyId, survey.responseId);
        const detail: SurveyDetailResponse = {
          surveyId: prevResponse.surveyId,
          surveyName: prevResponse.surveyName ?? survey.surveyName,
          description: prevResponse.description ?? survey.description,
          useYn: true,
          questions: prevResponse.questions ?? [],
          regDt: prevResponse.createdAt,
          updDt: prevResponse.createdAt,
        };
        detail.questions.sort((a, b) => (a.sortOrder ?? a.questionNumber) - (b.sortOrder ?? b.questionNumber));
        detail.questions.forEach((q) => q.options.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
        setSurveyDetail(detail);

        const prevAnswers: Record<number, number> = {};
        prevResponse.questions?.forEach((a: SurveyAnswerResponse) => {
          prevAnswers[a.questionId] = a.selectedOptionId;
        });
        setAnswers(prevAnswers);
        if (isCompleted) {
          setOriginalAnswers({ ...prevAnswers });
        }
      } else {
        const res = await getSurvey(survey.surveyId);
        const detail: SurveyDetailResponse = res.data.data;
        detail.questions.sort((a, b) => (a.sortOrder ?? a.questionNumber) - (b.sortOrder ?? b.questionNumber));
        detail.questions.forEach((q) => q.options.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
        setSurveyDetail(detail);
        setAnswers({});
        setOriginalAnswers({});
      }

      setView("detail");
      setCurrentStep(0);
      setIsEditMode(isCompleted);
    } catch {
      // 에러 시 목록으로
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBackToList = () => {
    setView("list");
    setSurveyDetail(null);
    setCurrentStep(0);
    setAnswers({});
    setOriginalAnswers({});
    setIsEditMode(false);
  };

  const handleAnswer = (optionId: number) => {
    if (!surveyDetail) return;
    const question = surveyDetail.questions[currentStep];
    setAnswers({ ...answers, [question.questionId]: optionId });
  };

  const handleNext = async () => {
    if (!surveyDetail) return;

    if (currentStep < surveyDetail.questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setSubmitting(true);
      try {
        const submitData: SurveySubmitRequest = {
          surveyId: surveyDetail.surveyId,
          answers: surveyDetail.questions
            .filter((q) => answers[q.questionId])
            .map((q) => {
              const optionId = answers[q.questionId];
              const option = q.options.find((o) => o.optionId === optionId);
              return {
                questionId: q.questionId,
                selectedOptionId: optionId,
                selectedValue: option?.optionValue ?? "",
              };
            }),
        };
        const surveyId = surveyDetail.surveyId;
        await submitSurvey(submitData);
        await fetchSurveyWithMyResponses();

        handleBackToList();
        onComplete(surveyId);
      } catch {
        // apiClient 인터셉터에서 에러 처리됨
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // ────────────── View 라우팅 ──────────────
  if (view === "list") {
    return (
      <SurveyList
        surveys={surveyWithMyResponses}
        completedSurveyIds={completedSurveyIds}
        incompleteCount={incompleteCount}
        loading={listLoading}
        onSelectSurvey={handleSelectSurvey}
      />
    );
  }

  // ────────────── 설문 상세 (응답/수정) 화면 ──────────────
  if (!surveyDetail || detailLoading || !surveyDetail.questions?.length) {
    return (
      <div className="p-4 space-y-4">
        <Card className="p-8 text-center bg-slate-700 border-slate-600">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-300">설문을 불러오는 중...</p>
        </Card>
      </div>
    );
  }

  const currentQuestion = surveyDetail.questions[currentStep];
  if (!currentQuestion) {
    setCurrentStep(0);
    return null;
  }

  return (
    <SurveyDetail
      surveyDetail={surveyDetail}
      currentStep={currentStep}
      answers={answers}
      originalAnswers={originalAnswers}
      isEditMode={isEditMode}
      submitting={submitting}
      onAnswer={handleAnswer}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onBackToList={handleBackToList}
    />
  );
}
