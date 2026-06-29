import { useState, useEffect, useCallback } from "react";
import { Card } from "@/app/components/ui/layout/card";
import type {
  SurveyDetailResponse,
  UserSurveyResponseDto,
  SurveySubmitRequest,
  SurveyAnswerResponse,
  SurveyWithMyResponse,
  PageResponse,
} from "@/app/types";
import {
  getSurvey,
  submitSurvey,
  getMySurveyResponse,
  getSurveyWithMyResponsesPaged,
} from "@/app/services/surveyService";
import { SurveyList } from "./components/SurveyList";
import { SurveyDetail } from "./components/SurveyDetail";

const PAGE_SIZE = 10;

interface SurveyProps {
  keyword: string;
  onComplete: (surveyId: number) => void;
}

export function InvestmentSurvey({ keyword, onComplete }: SurveyProps) {
  const [mySurveyResponses, setMySurveyResponses] = useState<UserSurveyResponseDto>();
  const [surveys, setSurveys] = useState<SurveyWithMyResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);

  const [surveyDetail, setSurveyDetail] = useState<SurveyDetailResponse | null>(null);
  const [view, setView] = useState<"list" | "detail">("list");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [originalAnswers, setOriginalAnswers] = useState<Record<number, number>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchList = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await getSurveyWithMyResponsesPaged({ keyword, page, size: PAGE_SIZE, sort: "regDt,desc" });
      const data = res.data.data;
      if (Array.isArray(data)) {
        // 구 형식: 배열 직접 반환
        setSurveys(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        // 신 형식: PageResponse<SurveyWithMyResponse>
        const paged = data as PageResponse<SurveyWithMyResponse>;
        setSurveys(paged.content ?? []);
        setTotalPages(paged.totalPages ?? 1);
        setTotalElements(paged.totalElements ?? 0);
      }
    } catch {
      // apiClient 인터셉터에서 에러 처리됨
    } finally {
      setListLoading(false);
    }
  }, [keyword, page]);

  useEffect(() => {
    if (view === "list") fetchList();
  }, [fetchList, view]);

  useEffect(() => {
    setPage(0);
  }, [keyword]);

  const handlePageChange = (p: number) => {
    setPage(p);
  };

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

  const completedSurveyIds = new Set(
    surveys.filter((r) => r.statusCode === "COMPLETED").map((r) => r.surveyId),
  );

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
        if (isCompleted) setOriginalAnswers({ ...prevAnswers });
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
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  if (view === "list") {
    return (
      <SurveyList
        surveys={surveys}
        completedSurveyIds={completedSurveyIds}
        loading={listLoading}
        keyword={keyword}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        onSelectSurvey={handleSelectSurvey}
      />
    );
  }

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
