import { useState, useEffect, useCallback } from "react";
import { Card } from "@/app/components/ui/layout/card";
import { Badge } from "@/app/components/ui/feedback/badge";
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { SurveyOptionsStatsResponse, SurveyStatsDetailResponse, PageResponse } from "@/app/types";
import { getOptionStats } from "@/app/services/surveyService";
import { getStatsResponsesPaged } from "@/app/services/surveyStatsService";

const PAGE_SIZE = 10;

interface SurveyStatisticsProps {
  keyword: string;
  defaultExpandedSurveyId?: number | null;
  onExpandHandled?: () => void;
}

export function SurveyStatistics({ keyword, defaultExpandedSurveyId, onExpandHandled }: SurveyStatisticsProps) {
  const [responses, setResponses] = useState<SurveyOptionsStatsResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);

  const [surveyDetails, setSurveyDetails] = useState<Record<number, SurveyStatsDetailResponse>>({});
  const [expandedSurvey, setExpandedSurvey] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStatsResponsesPaged({ keyword, page, size: PAGE_SIZE, sort: "regDt,desc" });
      const data = res.data.data;
      if (Array.isArray(data)) {
        // 구 형식: 배열 직접 반환
        setResponses(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        // 신 형식: PageResponse<SurveyOptionsStatsResponse>
        const paged = data as PageResponse<SurveyOptionsStatsResponse>;
        setResponses(paged.content ?? []);
        setTotalPages(paged.totalPages ?? 1);
        setTotalElements(paged.totalElements ?? 0);
      }
    } catch {
      // apiClient 인터셉터에서 에러 처리됨
    } finally {
      setLoading(false);
    }
  }, [keyword, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!loading && defaultExpandedSurveyId && responses.length > 0) {
      const target = responses.find((r) => r.surveyId === defaultExpandedSurveyId);
      if (target) {
        setExpandedSurvey(defaultExpandedSurveyId);
        fetchSurveyDetail(defaultExpandedSurveyId, target.responseId);
        onExpandHandled?.();
      }
    }
  }, [loading, defaultExpandedSurveyId, responses]);

  const fetchSurveyDetail = async (surveyId: number, responseId: number) => {
    if (surveyDetails[surveyId]) return;
    setDetailLoading(surveyId);
    try {
      const res = await getOptionStats(surveyId, responseId);
      const detail: SurveyStatsDetailResponse = res.data.data;
      detail.questions.sort((a, b) => (a.sortOrder ?? a.questionId) - (b.sortOrder ?? b.questionId));
      detail.questions.forEach((q) => q.options.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
      setSurveyDetails((prev) => ({ ...prev, [surveyId]: detail }));
    } catch {
      // apiClient 인터셉터에서 에러 처리됨
    } finally {
      setDetailLoading(null);
    }
  };

  const toggleSurvey = (surveyId: number, responseId: number) => {
    if (expandedSurvey === surveyId) {
      setExpandedSurvey(null);
    } else {
      setExpandedSurvey(surveyId);
      fetchSurveyDetail(surveyId, responseId);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [keyword]);

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">응답 내역</h2>
        </div>
        {!loading && (
          <span className="text-xs text-faint-foreground">총 {totalElements}개</span>
        )}
      </div>

      {/* 목록 */}
      {loading ? (
        <Card className="p-8 text-center bg-card border-border">
          <div className="w-7 h-7 border-2 border-primary/40 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        </Card>
      ) : responses.length === 0 ? (
        <Card className="p-6 text-center bg-card border-border">
          <BarChart3 className="w-10 h-10 text-faint-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {keyword ? "검색 결과가 없습니다." : "완료한 설문이 없습니다"}
          </p>
          {!keyword && (
            <p className="text-xs text-faint-foreground mt-1">설문을 완료하면 여기에 응답 내역이 표시됩니다.</p>
          )}
        </Card>
      ) : (
        <div className="space-y-2">
          {responses.map((response) => {
            const isExpanded = expandedSurvey === response.surveyId;
            const detail = surveyDetails[response.surveyId];
            const isLoadingDetail = detailLoading === response.surveyId;

            return (
              <Card key={response.surveyId} className="bg-card border-border overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => toggleSurvey(response.surveyId, response.responseId)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm text-foreground leading-snug">
                          {response.surveyName}
                        </h3>
                        <Badge className="bg-success/15 text-success text-[10px] px-1.5 py-0 border-0">
                          완료
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-faint-foreground">
                        <span>{response.regDt.slice(0, 10)}</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {response.totalParticipants}명 참여
                        </span>
                      </div>
                    </div>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-faint-foreground flex-shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-faint-foreground flex-shrink-0" />
                    }
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-4 bg-card">
                    {isLoadingDetail ? (
                      <div className="text-center py-4">
                        <div className="w-6 h-6 border-2 border-primary/40 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-xs text-faint-foreground">불러오는 중...</p>
                      </div>
                    ) : detail ? (
                      detail.questions.map((question, qIndex) => {
                        const myAnswer = { selectedOptionId: question.selectedOptionId };
                        return (
                          <div key={question.questionId} className="space-y-3">
                            <div className="flex items-start gap-2">
                              <Badge className="bg-accent text-primary text-[10px] px-1.5 py-0 mt-0.5 flex-shrink-0 border-0">
                                Q{qIndex + 1}
                              </Badge>
                              <h4 className="text-sm font-medium text-foreground leading-relaxed">
                                {question.questionText}
                              </h4>
                            </div>
                            <div className="space-y-1.5">
                              {question.options.map((option) => {
                                const percentage =
                                  response.totalParticipants === 0
                                    ? 0
                                    : Math.round((option.selectedCount / response.totalParticipants) * 100);
                                const isMyAnswer = option.optionId === myAnswer?.selectedOptionId;
                                return (
                                  <div key={option.optionId} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className={isMyAnswer ? "font-semibold text-primary" : "text-muted-foreground"}>
                                        {option.optionText}
                                      </span>
                                      <span className="text-faint-foreground tabular-nums">
                                        {option.selectedCount}명 · {percentage}%
                                      </span>
                                    </div>
                                    <div className="relative h-6 bg-muted rounded overflow-hidden">
                                      <div
                                        className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                                          isMyAnswer ? "bg-primary/40" : "bg-switch-background"
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                      />
                                      <div className="absolute inset-0 flex items-center px-2">
                                        <span className="text-xs font-medium text-foreground">{percentage}%</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {qIndex < detail.questions.length - 1 && (
                              <div className="border-t border-border" />
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-faint-foreground text-center py-2">상세 정보를 불러올 수 없습니다.</p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            이전
          </button>
          <span className="text-xs text-faint-foreground">
            {page + 1} / {totalPages}
            {keyword && <span className="ml-1 text-primary">· {totalElements}건</span>}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            다음
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
