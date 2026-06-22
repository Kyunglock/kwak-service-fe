// src/api/apiClient.ts
import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  CreateAxiosDefaults,
} from "axios";
import { removeAccessTokenCookie } from "@/app/utils/jwt";

interface ErrorResponse {
  success?: boolean;
  errorCode?: string;
  message: string;
}

import { showAlert } from "@/app/utils/alertEvent";

const showToast = (
  message: string,
  type: "error" | "success" | "warning" = "error",
) => {
  showAlert(message, type);
};

// 인증 만료 이벤트 (AuthContext와 동기화)
type AuthEventListener = () => void;
const authExpiredListeners: Set<AuthEventListener> = new Set();

export function onAuthExpired(listener: AuthEventListener) {
  authExpiredListeners.add(listener);
  return () => {
    authExpiredListeners.delete(listener);
  };
}

function clearAuthData() {
  removeAccessTokenCookie();
  authExpiredListeners.forEach((fn) => fn());
}

// ✅ 에러 코드별 처리
function handleErrorCode(errorCode: string, message: string, status: number) {
  switch (errorCode) {
    case "UNAUTHORIZED":
    case "TOKEN_EXPIRED":
    case "INVALID_TOKEN":
      clearAuthData();
      showToast("로그인이 필요합니다.");
      window.location.href = "/login";
      break;

    case "KAKAO_LOGIN_FAILED":
    case "KAKAO_TOKEN_ERROR":
      showToast("카카오 로그인에 실패했습니다.");
      window.location.href = "/login";
      break;

    case "KAKAO_ACCOUNT_NOT_FOUND":
      showToast("연결된 카카오 계정이 없습니다.");
      break;

    case "KAKAO_UNLINK_FAILED":
      showToast("카카오 연결 해제에 실패했습니다.");
      break;

    case "FORBIDDEN":
    case "ACCESS_DENIED":
      showToast("접근 권한이 없습니다.");
      break;

    case "NOT_FOUND":
    case "USER_NOT_FOUND":
      showToast("요청한 리소스를 찾을 수 없습니다.");
      break;

    case "INTERNAL_SERVER_ERROR":
      showToast(`서버 오류가 발생했습니다. (${status})`);
      break;

    default:
      // 기타 에러는 토스트로
      showToast(message);
  }
}

// ✅ HTTP 상태 코드 처리
function handleHttpStatus(status: number, message: string) {
  switch (status) {
    case 401:
      clearAuthData();
      showToast("인증이 필요합니다.");
      window.location.href = "/login";
      break;

    case 403:
      showToast("접근 권한이 없습니다.");
      break;

    case 404:
      // ✅ 404는 ErrorPage로
      redirectToErrorPage(404, message);
      break;

    case 500:
    case 502:
    case 503:
      showToast(`서버 오류가 발생했습니다. (${status})`);
      break;

    default:
      showToast(message);
  }
}

// ✅ ErrorPage로 리다이렉트
function redirectToErrorPage(code: number, message: string) {
  const encodedMessage = encodeURIComponent(message);
  window.location.href = `/error?code=${code}&message=${encodedMessage}`;
}

// ✅ 공통 인터셉터를 적용한 axios 인스턴스 생성
export function createApiClient(config: CreateAxiosDefaults): AxiosInstance {
  const client = axios.create({
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
    ...config,
  });

  // 요청 인터셉터
  client.interceptors.request.use(
    (cfg: InternalAxiosRequestConfig) => cfg,
    (error: AxiosError) => Promise.reject(error),
  );

  // 응답 인터셉터
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<ErrorResponse>) => {
      if (!error.response) {
        console.error("Network error:", error.message);
        showToast("네트워크 오류가 발생했습니다.");
        return Promise.reject(error);
      }

      const { status, data } = error.response;
      const errorCode = data?.errorCode;
      const errorMessage = data?.message || "오류가 발생했습니다.";

      if (errorCode) {
        handleErrorCode(errorCode, errorMessage, status);
        return Promise.reject(error);
      }

      handleHttpStatus(status, errorMessage);
      return Promise.reject(error);
    },
  );

  return client;
}

// 메인 apiClient (포트폴리오/인증 등)
const apiClient = createApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 설문 서비스 apiClient
export const surveyApiClient = createApiClient({
  baseURL: import.meta.env.VITE_SURVEY_API_BASE_URL,
});

// Stock Advisor 서비스 apiClient
export const stockAdvisorApiClient = createApiClient({
  baseURL: import.meta.env.VITE_STOCK_ADVISOR_API_BASE_URL,
});

// Guru 서비스 apiClient
export const guruApiClient = createApiClient({
  baseURL: import.meta.env.VITE_GURU_API_BASE_URL,
});

// Market Analysis 서비스 apiClient
export const marketAnalysisClient = createApiClient({
  baseURL: import.meta.env.VITE_MARKET_ANALYSIS_BASE_URL,
});

// 인사이트 서비스 apiClient (AI 분석으로 응답이 오래 걸림)
export const insightApiClient = createApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 120000,
});

export default apiClient;
