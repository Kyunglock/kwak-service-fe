import { useRouteError, useNavigate } from "react-router";
import { Button } from "@/app/components/ui/form/button";
import { Card } from "@/app/components/ui/layout/card";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

export function ErrorPage() {
  const error = useRouteError() as { status?: number; message?: string } | null;
  const navigate = useNavigate();

  const is404 = error?.status === 404;
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-card border-border shadow-paper p-8 text-center">
        {/* 아이콘 */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
        </div>

        {/* 에러 코드 */}
        <div className="mb-4">
          <h1 className="text-6xl font-bold text-foreground mb-2">
            {is404 ? "404" : "오류"}
          </h1>
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">
            {is404 ? "페이지를 찾을 수 없습니다" : "문제가 발생했습니다"}
          </h2>
        </div>

        {/* 에러 메시지 */}
        <p className="text-sm text-faint-foreground mb-6">
          {is404 
            ? "요청하신 페이지가 존재하지 않거나 삭제되었습니다."
            : error?.message || "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
          }
        </p>

        {/* 버튼 */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => navigate("/")}
            className="w-full bg-primary hover:bg-primary-strong text-primary-foreground"
          >
            <Home className="w-4 h-4 mr-2" />
            홈으로 가기
          </Button>
          
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full border-border text-muted-foreground hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            이전 페이지로
          </Button>
        </div>
      </Card>
    </div>
  );
}
