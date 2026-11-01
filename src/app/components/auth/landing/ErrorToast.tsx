import { AlertCircle } from "lucide-react";
import { Card } from "@/app/components/ui/layout/card";

// 스크롤 페이지 어디에서든 보이도록 화면 상단에 고정
export function ErrorToast({
  message,
  onClose,
}: {
  message: string | null;
  onClose: () => void;
}) {
  if (!message) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
      <Card className="p-4 bg-card border-destructive/40 shadow-float animate-in slide-in-from-top">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-foreground">{message}</p>
          </div>
          <button onClick={onClose} className="text-faint-foreground hover:text-foreground">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </Card>
    </div>
  );
}
