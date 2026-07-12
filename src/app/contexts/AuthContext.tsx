import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { onAuthExpired } from "@/app/utils/apiClient";
import { getAuthFromCookie, removeAccessTokenCookie } from "@/app/utils/jwt";
import { getMe } from "@/app/services/userService";

interface AuthUser {
  userId: string;
  nickname: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 쿠키에서 JWT 읽어 유저 정보 복원 후 /me로 보정
  // (JWT sub는 sessionId라 페이로드 디코딩으로는 userId/nickname을 알 수 없음)
  useEffect(() => {
    const auth = getAuthFromCookie();
    if (auth) {
      setUser({ userId: auth.userId, nickname: auth.nickname });
      getMe()
        .then((res) => {
          const me = res.data.data;
          if (me) setUser({ userId: me.userId, nickname: me.nickname ?? "" });
        })
        .catch(() => {
          // 보정 실패 시 쿠키 기반 값 유지
        });
    }
    setIsLoading(false);
  }, []);

  // apiClient에서 401/TOKEN_EXPIRED 발생 시 상태 동기화
  useEffect(() => {
    return onAuthExpired(() => {
      setUser(null);
    });
  }, []);

  // OAuth 콜백 후 쿠키에서 JWT 읽기 (백엔드가 쿠키에 accessToken 세팅)
  const login = useCallback(() => {
    const auth = getAuthFromCookie();
    if (auth) {
      setUser({ userId: auth.userId, nickname: auth.nickname });
    }
  }, []);

  const logout = useCallback(() => {
    removeAccessTokenCookie();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
