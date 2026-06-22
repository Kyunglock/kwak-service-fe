import { Card } from "@/app/components/ui/layout/card";
import { Badge } from "@/app/components/ui/feedback/badge";
import { ClipboardList, CheckCircle2, ChevronRight, Calendar } from "lucide-react";
import type { SurveyWithMyResponse } from "@/app/types";

interface SurveyListProps {
  surveys: SurveyWithMyResponse[];
  completedSurveyIds: Set<number>;
  incompleteCount: number;
  loading: boolean;
  onSelectSurvey: (survey: SurveyWithMyResponse) => void;
}

export function SurveyList({ surveys, completedSurveyIds, incompleteCount, loading, onSelectSurvey }: SurveyListProps) {
  if (loading) {
    return (
      <div className="p-4 space-y-4 pb-20">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-semibold text-gray-100">투자 설문</h2>
        </div>
        <Card className="p-8 text-center bg-slate-700 border-slate-600">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-300">설문 목록을 불러오는 중...</p>
        </Card>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="p-4 space-y-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-semibold text-gray-100">투자 설문</h2>
        </div>
        {incompleteCount > 0 && (
          <Badge variant="destructive" className="bg-red-600 text-white">
            미참여 {incompleteCount}개
          </Badge>
        )}
      </div>

      <div className="bg-cyan-950 border border-cyan-800 rounded-lg p-3 text-sm text-cyan-300">
        <p className="font-medium mb-1">AI 생성 설문</p>
        <p className="text-xs">시장 동향을 바탕으로 매일 새로운 설문이 생성됩니다.</p>
      </div>

      <div className="space-y-3">
        {surveys.map((survey) => {
          const isCompleted = completedSurveyIds.has(survey.surveyId);
          const isToday = survey.regDt.startsWith(today);

          return (
            <Card
              key={survey.surveyId}
              className={`p-4 cursor-pointer transition-all hover:scale-[1.02] ${
                isCompleted
                  ? "bg-slate-700/70 border-green-600/30 hover:border-green-500/50"
                  : "bg-slate-700 border-cyan-600/50 hover:border-cyan-500"
              }`}
              onClick={() => onSelectSurvey(survey)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-gray-100">{survey.surveyName}</h3>
                    {isToday && !isCompleted && (
                      <Badge className="bg-cyan-600 text-white text-xs">NEW</Badge>
                    )}
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {survey.regDt.slice(0, 10)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">{survey.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
              </div>

              {isCompleted && (
                <div className="mt-2 pt-2 border-t border-slate-600">
                  <span className="text-xs text-green-400 font-medium">✓ 완료됨 · 클릭하여 수정하기</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {surveys.length === 0 && (
        <Card className="p-8 text-center bg-slate-700/50 border-slate-600">
          <ClipboardList className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-sm text-gray-300">등록된 설문이 없습니다.</p>
        </Card>
      )}

      {incompleteCount === 0 && surveys.length > 0 && (
        <Card className="p-6 text-center bg-slate-700/50 border-slate-600 mt-4">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-sm text-gray-300 font-medium">모든 설문을 완료했습니다!</p>
          <p className="text-xs text-gray-400 mt-2">새로운 설문은 매일 업데이트됩니다.</p>
        </Card>
      )}
    </div>
  );
}
