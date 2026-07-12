import apiClient from "@/app/utils/apiClient";
import type { ApiResponse } from "@/app/types";

export interface MeResponse {
  userId: string;
  nickname: string | null;
  isAdmin: boolean;
}

export interface NicknameCheckResponse {
  available: boolean;
  reason: string | null;
}

// 내 정보 조회 (유저 정보 단일 소스 — JWT 페이로드엔 sessionId뿐이라 디코딩 불가)
export const getMe = () => apiClient.get<ApiResponse<MeResponse>>("/api/v1/users/me");

// 닉네임 중복/형식 확인
export const checkNickname = (nickname: string) =>
  apiClient.get<ApiResponse<NicknameCheckResponse>>("/api/v1/users/nickname/check", {
    params: { nickname },
  });

// 닉네임 설정
export const setNickname = (nickname: string) =>
  apiClient.put<ApiResponse<{ nickname: string }>>("/api/v1/users/me/nickname", { nickname });
