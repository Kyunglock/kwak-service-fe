import { useState, useEffect, useCallback } from "react";
import { Card } from "@/app/components/ui/layout/card";
import { Badge } from "@/app/components/ui/feedback/badge";
import { BarChart3, ChevronDown, ChevronUp, CheckCircle2, Calendar, Users, TrendingUp } from "lucide-react";
import type { SurveyOptionsStatsResponse, SurveyStatsDetailResponse } from "@/app/types";
import { getOptionStats } from "@/app/services/surveyService";
import { getStatsResponses } from "@/app/services/surveyStatsService";

interface SurveyStatisticsProps {
  defaultExpandedSurveyId?: number | null;
  onExpandHandled?: () => void;
}

export function SurveyStatistics({ defaultExpandedSurveyId, onExpandHandled }: SurveyStatisticsProps = {}) {
  const [myResponses, setMyResponses] = useState<SurveyOptionsStatsResponse[]>([]);
  const [surveyDetails, setSurveyDetails] = useState<Record<number, SurveyStatsDetailResponse>>({});
  const [expandedSurvey, setExpandedSurvey] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState<number | null>(null);

  // 내 응답 이력 로드 (tbl_user_survey_response)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStatsResponses();
      setMyResponses(res.data.data ?? []);
    } catch {
      // apiClient 인터셉터에서 에러 처리됨
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 완료된 설문 자동 펼침
  useEffect(() => {
    if (!loading && defaultExpandedSurveyId && myResponses.length > 0) {
      const target = myResponses.find((r) => r.surveyId === defaultExpandedSurveyId);
      if (target) {
        setExpandedSurvey(defaultExpandedSurveyId);
        fetchSurveyDetail(defaultExpandedSurveyId, target.responseId);
        onExpandHandled?.();
      }
    }
  }, [loading, defaultExpandedSurveyId, myResponses]);

  // 설문 상세 로드 (질문/선택지 텍스트 표시용)
  const fetchSurveyDetail = async (surveyId: number, responseId: number) => {
    if (surveyDetails[surveyId]) return;
    setDetailLoading(surveyId);
    try {
      const res = await getOptionStats(surveyId, responseId);
      const detail: SurveyStatsDetailResponse = res.data.data;
      
      detail.questions.sort((a, b) => (a.sortOrder ?? a.questionId) - (b.sortOrder ?? b.questionId));
      detail.questions.forEach((q) => q.options.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
      setSurveyDetails((prev) => ({ ...prev, [surveyId]: detail }));
    } catch (error) {
      
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

  // 완료된 응답만 표시
  const completedResponses = myResponses.filter((r) => r.statusCode === "COMPLETED");

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            설문 통계
          </h2>
        </div>
        <Card className="p-8 text-center bg-slate-700 border-slate-600">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-300">통계를 불러오는 중...</p>
        </Card>
      </div>
    );
  }

  if (completedResponses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            설문 통계
          </h2>
        </div>

        <Card className="p-8 text-center bg-slate-700/50 border-slate-600">
          <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-sm text-gray-300 font-medium mb-2">
            아직 완료한 설문이 없습니다
          </p>
          <p className="text-xs text-gray-400">
            설문을 완료하시면 나의 응답 내역을 확인할 수 있습니다.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-semibold text-gray-100">설문 통계</h2>
      </div>

      <div className="bg-purple-950 border border-purple-800 rounded-lg p-3 text-sm text-purple-300">
        <p className="font-medium mb-1">📊 나의 응답 내역</p>
        <p className="text-xs">
          완료한 설문 {completedResponses.length}개의 응답 내역을 확인할 수 있습니다.
        </p>
      </div>

      <div className="space-y-3">
        {completedResponses.map((response) => {
          const isExpanded = expandedSurvey === response.surveyId;
          const detail = surveyDetails[response.surveyId];
          const isLoadingDetail = detailLoading === response.surveyId;

          return (
            <Card key={response.surveyId} className="bg-slate-700 border-slate-600 overflow-hidden">
              {/* 설문 헤더 */}
              <div
                className="p-4 cursor-pointer hover:bg-slate-600/50 transition-colors"
                onClick={() => toggleSurvey(response.surveyId, response.responseId)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-gray-100">
                        {response.surveyName}
                      </h3>
                      <Badge className="bg-green-600 text-white text-xs">
                        완료
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{response.regDt.slice(0, 10)}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
                  )}
                </div>

                {/* <div className="flex items-center gap-3 text-xs text-gray-400">
                  {response.regDt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {response.regDt.slice(0, 10)}
                    </span>
                  )}
                  {response.riskProfile && (
                    <Badge className="bg-purple-600/50 text-purple-300 text-[10px]">
                      {response.riskProfile}
                    </Badge>
                  )}
                </div> */}

                {/* 참여자 요약 */}
                <div className="flex items-center gap-2 text-xs text-gray-300 bg-slate-600/50 rounded p-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>총 {response.totalParticipants}명 참여</span>
                  <TrendingUp className="w-3 h-3 text-green-400 ml-auto" />
                </div>
              </div>

              {/* 질문별 내 응답 (확장 시 표시) */}
              {isExpanded && (
                <div className="border-t border-slate-600 p-4 space-y-4 bg-slate-700/50">
                  {isLoadingDetail ? (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs text-gray-400">질문 정보를 불러오는 중...</p>
                    </div>
                  ) : detail ? (
                    detail.questions.map((question, qIndex) => {
                      const myAnswer = {selectedOptionId : question.selectedOptionId}

                      return (
                        <div key={question.questionId} className="space-y-3">
                          <div className="flex items-start gap-2">
                            <Badge className="bg-purple-600 text-white text-xs mt-0.5">
                              Q{qIndex + 1}
                            </Badge>
                            <h4 className="text-sm font-semibold text-gray-100 leading-relaxed flex-1">
                              {question.questionText}
                            </h4>
                          </div>
                          <div className="space-y-2">
                            
                            {question.options.map((option) => {
                              const percentage = response.totalParticipants === 0 ? 0 : Math.round((option.selectedCount / response.totalParticipants) * 100);
                              const isMyAnswer = option.optionId === myAnswer?.selectedOptionId;
                              return (
                                <div className="space-y-1">
                                  <div
                                    key={option.optionId}
                                    className={`flex items-center justify-between text-xs`}
                                  >
                                    <span
                                      className={`${
                                        isMyAnswer
                                          ? "font-bold text-purple-300"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      {option.optionText}
                                    </span>
                                    <span
                                      className="text-gray-400"
                                    >
                                      {option.selectedCount}명 ({percentage}%)
                                    </span>
                                  </div>
                                  <div className="relative h-7 bg-slate-600/50 rounded-lg overflow-hidden">
                                    <div
                                      className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                                        isMyAnswer 
                                          ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                                          : 'bg-gradient-to-r from-slate-500 to-slate-600'
                                      }`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className={`text-xs font-semibold ${
                                        percentage > 20 ? 'text-white' : 'text-gray-300'
                                      }`}>
                                        {percentage}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {qIndex < detail.questions.length - 1 && (
                            <div className="border-t border-slate-600 pt-3" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-2">
                      설문 상세 정보를 불러올 수 없습니다.
                    </p>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* 전체 통계 인사이트 */}
      <Card className="p-4 bg-gradient-to-br from-purple-700 to-pink-700 text-white border-0">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold mb-2">응답 요약</h4>
            <p className="text-xs leading-relaxed opacity-95">
              총 {completedResponses.length}개 설문에 응답하셨습니다.
              {/* {completedResponses.some((r) => r.riskProfile) && (
                <> 투자 성향: <span className="font-semibold">{completedResponses.find((r) => r.riskProfile)?.riskProfile}</span></>
              )} */}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
