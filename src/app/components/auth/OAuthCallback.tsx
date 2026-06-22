import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/app/contexts/AuthContext";
import { getAccessToken } from "@/app/utils/jwt";
import { Loader2 } from "lucide-react";

export function OAuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // 백엔드가 리다이렉트 시 쿠키에 accessToken을 설정함
    const token = getAccessToken();

    if (token) {
      login();
      navigate("/", { replace: true });
    } else {
      navigate("/login?error=" + encodeURIComponent("로그인 정보를 받지 못했습니다."), { replace: true });
    }
  }, [login, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-indigo-400 mx-auto mb-4 animate-spin" />
        <p className="text-gray-300 text-sm">로그인 처리 중...</p>
      </div>
    </div>
  );
}
