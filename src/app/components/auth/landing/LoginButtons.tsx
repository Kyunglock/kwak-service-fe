import { Button } from "@/app/components/ui/form/button";
import { UserRound } from "lucide-react";
import type { LoginActions } from "./useLoginActions";

export function LoginButtons({ actions }: { actions: LoginActions }) {
  const { isKakaoLoading, isGuestLoading, handleKakaoLogin, handleGuestLogin } = actions;

  return (
    <div className="space-y-4">
      <Button
        onClick={handleKakaoLogin}
        disabled={isKakaoLoading || isGuestLoading}
        className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] font-semibold text-base shadow-lg disabled:opacity-50"
      >
        {isKakaoLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
            <span>로그인 중...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
            </svg>
            <span>카카오로 시작하기</span>
          </div>
        )}
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-700"></div>
        <span className="text-xs text-gray-500">또는</span>
        <div className="flex-1 h-px bg-slate-700"></div>
      </div>

      <Button
        onClick={handleGuestLogin}
        disabled={isKakaoLoading || isGuestLoading}
        variant="outline"
        className="w-full h-12 border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700 font-semibold text-base"
      >
        {isGuestLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-slate-400/20 border-t-slate-300 rounded-full animate-spin"></div>
            <span>로그인 중...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <UserRound className="w-5 h-5" />
            <span>손님으로 시작하기</span>
          </div>
        )}
      </Button>
    </div>
  );
}
