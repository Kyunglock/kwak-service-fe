import { useRouteError, useNavigate } from "react-router";
import { Button } from "@/app/components/ui/form/button";
import { Card } from "@/app/components/ui/layout/card";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

export function ErrorPage() {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  const is404 = error?.status === 404;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-slate-800 border-slate-700 p-8 text-center">
        {/* 아이콘 */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
        </div>

        {/* 에러 코드 */}
        <div className="mb-4">
          <h1 className="text-6xl font-bold text-gray-100 mb-2">
            {is404 ? "404" : "오류"}
          </h1>
          <h2 className="text-xl font-semibold text-gray-300 mb-2">
            {is404 ? "페이지를 찾을 수 없습니다" : "문제가 발생했습니다"}
          </h2>
        </div>

        {/* 에러 메시지 */}
        <p className="text-sm text-gray-400 mb-6">
          {is404 
            ? "요청하신 페이지가 존재하지 않거나 삭제되었습니다."
            : error?.message || "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
          }
        </p>

        {/* 버튼 */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            홈으로 가기
          </Button>
          
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full border-slate-600 text-gray-300 hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            이전 페이지로
          </Button>
        </div>
      </Card>
    </div>
  );
}
