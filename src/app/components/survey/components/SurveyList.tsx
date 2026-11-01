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
import { INVEST_MBTI_TONE } from "@/app/theme/featurePalettes";

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent ring-1 ring-ring/50">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">투자 설문</h2>
            <p className="text-xs text-faint-foreground">시장 동향 기반 AI 생성</p>
          </div>
        </div>
        {incompleteCount > 0 && (
          <Badge className="bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-full">
            미참여 {incompleteCount}
          </Badge>
        )}
      </div>

      {/* 목록 */}
      {loading ? (
        <Card className="p-10 text-center bg-card border-border">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary/40 border-t-transparent" />
          <p className="text-sm text-muted-foreground">설문 목록을 불러오는 중...</p>
        </Card>
      ) : surveys.length === 0 ? (
        <Card className="p-12 text-center bg-card border-border">
          <ClipboardList className="mx-auto mb-3 h-12 w-12 text-faint-foreground" />
          <p className="text-sm text-muted-foreground">
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
            const barColor = isCompleted ? "bg-success" : isMbti ? INVEST_MBTI_TONE.bar : "bg-primary";
            const hoverBorder = isCompleted
              ? "hover:border-success/50"
              : isMbti
                ? INVEST_MBTI_TONE.hoverBorder
                : "hover:border-primary/40";

            return (
              <Card
                key={survey.surveyId}
                onClick={() => onSelectSurvey(survey)}
                className={`group relative cursor-pointer gap-0 overflow-hidden rounded-xl border border-border bg-card p-0 transition-all hover:bg-accent hover:shadow-paper ${hoverBorder}`}
              >
                {/* 좌측 액센트 바 */}
                <div className={`absolute inset-y-0 left-0 w-1 ${barColor}`} />

                <div className="flex items-center gap-3.5 py-4 pl-5 pr-4">
                  {/* 리딩 아이콘 */}
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-xl ${
                      isCompleted
                        ? "bg-success/10 ring-1 ring-success/30"
                        : isMbti
                          ? `${INVEST_MBTI_TONE.surface} ring-1 ring-[#9A4A61]/30`
                          : "bg-accent ring-1 ring-ring/50"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    ) : isMbti ? (
                      <span>🧬</span>
                    ) : (
                      <ClipboardList className="h-6 w-6 text-primary" />
                    )}
                  </div>

                  {/* 본문 */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <h3 className="text-[15px] font-semibold leading-snug text-foreground">
                        {survey.surveyName}
                      </h3>
                      {isMbti && (
                        <Badge className={`gap-0.5 rounded-full ${INVEST_MBTI_TONE.surface} ${INVEST_MBTI_TONE.text} px-2 py-0 text-[11px]`}>
                          <Sparkles className="h-3 w-3" /> 투자 MBTI
                        </Badge>
                      )}
                      {isToday && !isCompleted && (
                        <Badge className="rounded-full bg-accent px-2 py-0 text-[11px] text-foreground">NEW</Badge>
                      )}
                    </div>

                    <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                      {survey.description}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-faint-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {survey.regDt.slice(0, 10)}
                      </span>
                      {isCompleted ? (
                        <span className="flex items-center gap-1 font-medium text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" /> 완료 · 클릭하여 수정
                        </span>
                      ) : (
                        <span className="font-medium text-primary">참여하기</span>
                      )}
                    </div>
                  </div>

                  {/* 화살표 */}
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-card text-muted-foreground transition-all group-hover:bg-accent group-hover:text-foreground">
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
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            이전
          </button>
          <span className="text-xs text-faint-foreground">
            {page + 1} / {totalPages}
            {keyword && <span className="ml-1 text-primary">· {totalElements}건</span>}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            다음
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
