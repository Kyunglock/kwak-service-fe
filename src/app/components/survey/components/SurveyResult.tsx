import { Card } from "@/app/components/ui/layout/card";
import { Button } from "@/app/components/ui/form/button";
import { Badge } from "@/app/components/ui/feedback/badge";
import { BarChart3, Users, CheckCircle2, ArrowLeft } from "lucide-react";
import type { SurveyStatsDetailResponse } from "@/app/types";

interface SurveyResultProps {
  statsLoading: boolean;
  surveyStatsDetail: SurveyStatsDetailResponse | null;
  onBackToList: () => void;
}

export function SurveyResult({ statsLoading, surveyStatsDetail, onBackToList }: SurveyResultProps) {
  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToList}
            className="gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-3 text-sm font-medium text-gray-200 hover:border-slate-500 hover:bg-slate-700 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            목록
          </Button>
          <h2 className="text-lg font-semibold text-gray-100 flex-1">설문 결과</h2>
        </div>
        <Card className="p-8 text-center bg-slate-700 border-slate-600">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-300">결과를 불러오는 중...</p>
        </Card>
      </div>
    );
  }

  if (!surveyStatsDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToList}
            className="gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-3 text-sm font-medium text-gray-200 hover:border-slate-500 hover:bg-slate-700 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            목록
          </Button>
          <h2 className="text-lg font-semibold text-gray-100 flex-1">설문 결과</h2>
        </div>
        <Card className="p-4 bg-green-700/30 border-green-600 text-center">
          <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
          <p className="text-sm text-gray-100 font-semibold">설문이 완료되었습니다!</p>
          <p className="text-xs text-gray-400 mt-1">통계 데이터를 불러올 수 없습니다.</p>
        </Card>
        <Button onClick={onBackToList} className="w-full bg-slate-600 hover:bg-slate-500 text-white">
          설문 목록으로
        </Button>
      </div>
    );
  }

  const totalParticipants = surveyStatsDetail.questions[0]?.options.reduce(
    (sum, o) => sum + o.selectedCount, 0
  ) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={onBackToList} className="text-gray-300 hover:text-white -ml-2">
          ← 목록
        </Button>
        <h2 className="text-lg font-semibold text-gray-100 flex-1">설문 결과</h2>
      </div>

      {/* 완료 안내 */}
      <Card className="p-4 bg-gradient-to-r from-green-700 to-cyan-700 border-0 text-white">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">설문이 완료되었습니다!</p>
            <p className="text-xs opacity-90 mt-0.5">다른 참여자들의 응답과 비교해보세요.</p>
          </div>
        </div>
      </Card>

      {/* 참여자 수 */}
      <div className="flex items-center gap-2 text-xs text-gray-300 bg-slate-700 rounded-lg px-3 py-2 border border-slate-600">
        <Users className="w-4 h-4 text-cyan-400" />
        <span>총 <span className="font-semibold text-white">{totalParticipants}명</span> 참여</span>
      </div>

      {/* 질문별 결과 */}
      <div className="space-y-3">
        {surveyStatsDetail.questions.map((question, qIndex) => {
          const qTotal = question.options.reduce((sum, o) => sum + o.selectedCount, 0);
          return (
            <Card key={question.questionId} className="bg-slate-700 border-slate-600 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Badge className="bg-purple-600 text-white text-xs mt-0.5 flex-shrink-0">
                  Q{qIndex + 1}
                </Badge>
                <h4 className="text-sm font-semibold text-gray-100 leading-relaxed">
                  {question.questionText}
                </h4>
              </div>

              <div className="space-y-2">
                {question.options.map((option) => {
                  const pct = qTotal === 0 ? 0 : Math.round((option.selectedCount / qTotal) * 100);
                  const isMyAnswer = option.optionId === question.selectedOptionId;
                  return (
                    <div key={option.optionId} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={isMyAnswer ? "font-bold text-purple-300 flex items-center gap-1" : "text-gray-400"}>
                          {isMyAnswer && <CheckCircle2 className="w-3 h-3" />}
                          {option.optionText}
                        </span>
                        <span className="text-gray-400">{option.selectedCount}명 ({pct}%)</span>
                      </div>
                      <div className="relative h-7 bg-slate-600/50 rounded-lg overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                            isMyAnswer
                              ? "bg-gradient-to-r from-purple-500 to-pink-500"
                              : "bg-gradient-to-r from-slate-500 to-slate-600"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-xs font-semibold ${pct > 20 ? "text-white" : "text-gray-300"}`}>
                            {pct}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <Button onClick={onBackToList} className="w-full bg-slate-600 hover:bg-slate-500 text-white">
        설문 목록으로
      </Button>
    </div>
  );
}
