import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { kakaoLogin, guestLogin } from "@/app/services/authService";
import { useAuth } from "@/app/contexts/AuthContext";

export interface LoginActions {
  isKakaoLoading: boolean;
  isGuestLoading: boolean;
  errorMessage: string | null;
  clearError: () => void;
  handleKakaoLogin: () => Promise<void>;
  handleGuestLogin: () => Promise<void>;
}

// 카카오/손님 로그인 + URL error 파라미터 토스트 + 로그인 시 "/" 리다이렉트.
// LoginPage에서 한 번만 호출하고 HeroSection/FinalCTA에 내려보내
// 양쪽 버튼이 로딩·에러 상태를 공유한다.
export function useLoginActions(): LoginActions {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoggedIn, login } = useAuth();
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get("error");

    if (error) {
      const decodedError = decodeURIComponent(error);
      setErrorMessage(decodedError);

      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);

      window.history.replaceState({}, "", window.location.pathname);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleKakaoLogin = async () => {
    setIsKakaoLoading(true);
    setErrorMessage(null);

    try {
      const response = await kakaoLogin();
      window.location.href = response.data.data;
    } catch {
      setIsKakaoLoading(false);
      setErrorMessage("로그인 요청에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleGuestLogin = async () => {
    setIsGuestLoading(true);
    setErrorMessage(null);

    try {
      await guestLogin();
      login();
    } catch {
      setIsGuestLoading(false);
      setErrorMessage("손님 로그인에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return {
    isKakaoLoading,
    isGuestLoading,
    errorMessage,
    clearError: () => setErrorMessage(null),
    handleKakaoLogin,
    handleGuestLogin,
  };
}
