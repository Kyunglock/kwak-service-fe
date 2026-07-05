import { Card } from "@/app/components/ui/layout/card";
import { Badge } from "@/app/components/ui/feedback/badge";
import {
  ClipboardList,
  CheckCircle2,
  ChevronRight,
  Calendar,
  ChevronLeft,
  Sparkles,
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
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/25 to-blue-600/15 ring-1 ring-cyan-500/30">
            <ClipboardList className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">투자 설문</h2>
            <p className="text-xs text-gray-500">시장 동향 기반 AI 생성</p>
          </div>
        </div>
        {incompleteCount > 0 && (
          <Badge className="bg-red-500/90 text-white text-xs px-2.5 py-1 rounded-full">
            미참여 {incompleteCount}
          </Badge>
        )}
      </div>

      {/* 목록 */}
      {loading ? (
        <Card className="p-10 text-center bg-slate-800/60 border-slate-700/60">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="text-sm text-gray-400">설문 목록을 불러오는 중...</p>
        </Card>
      ) : surveys.length === 0 ? (
        <Card className="p-12 text-center bg-slate-800/40 border-slate-700/60">
          <ClipboardList className="mx-auto mb-3 h-12 w-12 text-gray-600" />
          <p className="text-sm text-gray-400">
            {keyword ? "검색 결과가 없습니다." : "등록된 설문이 없습니다."}
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {surveys.map((survey) => {
            const isCompleted = completedSurveyIds.has(survey.surveyId);
            const isToday = survey.regDt.startsWith(today);
            const isMbti = survey.surveyTypeCode === "RISK_PROFILE";

            // 좌측 액센트 바 색상 (완료 > MBTI > 기본)
            const barColor = isCompleted ? "bg-emerald-500" : isMbti ? "bg-pink-500" : "bg-cyan-500";
            const hoverBorder = isCompleted
              ? "hover:border-emerald-500/50"
              : isMbti
                ? "hover:border-pink-500/50"
                : "hover:border-cyan-500/50";

            return (
              <Card
                key={survey.surveyId}
                onClick={() => onSelectSurvey(survey)}
                className={`group relative cursor-pointer gap-0 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-800/70 p-0 transition-all hover:bg-slate-700/60 hover:shadow-lg ${hoverBorder}`}
              >
                {/* 좌측 액센트 바 */}
                <div className={`absolute inset-y-0 left-0 w-1 ${barColor}`} />

                <div className="flex items-center gap-3.5 py-4 pl-5 pr-4">
                  {/* 리딩 아이콘 */}
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-xl ${
                      isCompleted
                        ? "bg-emerald-500/15 ring-1 ring-emerald-500/30"
                        : isMbti
                          ? "bg-gradient-to-br from-pink-500/25 to-rose-600/15 ring-1 ring-pink-500/30"
                          : "bg-cyan-500/15 ring-1 ring-cyan-500/30"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    ) : isMbti ? (
                      <span>🧬</span>
                    ) : (
                      <ClipboardList className="h-6 w-6 text-cyan-300" />
                    )}
                  </div>

                  {/* 본문 */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <h3 className="text-[15px] font-semibold leading-snug text-gray-100">
                        {survey.surveyName}
                      </h3>
                      {isMbti && (
                        <Badge className="gap-0.5 rounded-full bg-pink-600/80 px-2 py-0 text-[11px] text-white">
                          <Sparkles className="h-3 w-3" /> 투자 MBTI
                        </Badge>
                      )}
                      {isToday && !isCompleted && (
                        <Badge className="rounded-full bg-cyan-600/80 px-2 py-0 text-[11px] text-white">NEW</Badge>
                      )}
                    </div>

                    <p className="line-clamp-2 text-[13px] leading-relaxed text-gray-400">
                      {survey.description}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {survey.regDt.slice(0, 10)}
                      </span>
                      {isCompleted ? (
                        <span className="flex items-center gap-1 font-medium text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> 완료 · 클릭하여 수정
                        </span>
                      ) : (
                        <span className="font-medium text-cyan-400">참여하기</span>
                      )}
                    </div>
                  </div>

                  {/* 화살표 */}
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-700/60 text-gray-400 transition-all group-hover:bg-slate-600 group-hover:text-gray-100">
                    <ChevronRight className="h-4 w-4" />
                  </div>
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
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-slate-700 hover:text-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            이전
          </button>
          <span className="text-xs text-gray-500">
            {page + 1} / {totalPages}
            {keyword && <span className="ml-1 text-cyan-500">· {totalElements}건</span>}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-slate-700 hover:text-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
          >
            다음
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
