import { Card } from "@/app/components/ui/layout/card";
import { Badge } from "@/app/components/ui/feedback/badge";
import {
  ClipboardList,
  CheckCircle2,
  ChevronRight,
  Calendar,
  ChevronLeft,
} from "lucide-react";
import type { SurveyWithMyResponse } from "@/app/types";

interface SurveyListProps {
  surveys: SurveyWithMyResponse[];
  completedSurveyIds: Set<number>;
  loading: boolean;
  keyword: string;
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onSelectSurvey: (survey: SurveyWithMyResponse) => void;
}

export function SurveyList({
  surveys,
  completedSurveyIds,
  loading,
  keyword,
  page,
  totalPages,
  totalElements,
  onPageChange,
  onSelectSurvey,
}: SurveyListProps) {
  const today = new Date().toISOString().split("T")[0];
  const incompleteCount = surveys.filter((s) => !completedSurveyIds.has(s.surveyId)).length;

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-gray-100">투자 설문</h2>
          <span className="text-xs text-gray-500">시장 동향 기반 AI 생성</span>
        </div>
        {incompleteCount > 0 && (
          <Badge className="bg-red-600/80 text-white text-xs">
            미참여 {incompleteCount}
          </Badge>
        )}
      </div>

      {/* 목록 */}
      {loading ? (
        <Card className="p-8 text-center bg-slate-700 border-slate-600">
          <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">설문 목록을 불러오는 중...</p>
        </Card>
      ) : surveys.length === 0 ? (
        <Card className="p-8 text-center bg-slate-700/50 border-slate-600">
          <ClipboardList className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            {keyword ? "검색 결과가 없습니다." : "등록된 설문이 없습니다."}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {surveys.map((survey) => {
            const isCompleted = completedSurveyIds.has(survey.surveyId);
            const isToday = survey.regDt.startsWith(today);

            return (
              <Card
                key={survey.surveyId}
                className={`p-4 cursor-pointer transition-colors border ${
                  isCompleted
                    ? "bg-slate-700/50 border-slate-600 hover:border-green-600/50 hover:bg-slate-700"
                    : "bg-slate-700 border-slate-600 hover:border-cyan-600/60 hover:bg-slate-600/60"
                }`}
                onClick={() => onSelectSurvey(survey)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-medium text-sm text-gray-100 leading-snug">
                        {survey.surveyName}
                      </h3>
                      {isToday && !isCompleted && (
                        <Badge className="bg-cyan-600/80 text-white text-[10px] px-1.5 py-0">NEW</Badge>
                      )}
                      {isCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1.5">
                      <Calendar className="w-3 h-3" />
                      <span>{survey.regDt.slice(0, 10)}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                      {survey.description}
                    </p>
                    {isCompleted && (
                      <p className="text-xs text-green-400 mt-2">✓ 완료 · 클릭하여 수정</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            이전
          </button>
          <span className="text-xs text-gray-500">
            {page + 1} / {totalPages}
            {keyword && (
              <span className="ml-1 text-cyan-500">· {totalElements}건</span>
            )}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            다음
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
