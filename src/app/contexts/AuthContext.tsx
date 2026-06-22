import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { onAuthExpired } from "@/app/utils/apiClient";
import { getAuthFromCookie, removeAccessTokenCookie } from "@/app/utils/jwt";

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

  // 앱 시작 시 쿠키에서 JWT 읽어 유저 정보 복원
  useEffect(() => {
    const auth = getAuthFromCookie();
    if (auth) {
      setUser({ userId: auth.userId, nickname: auth.nickname });
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
