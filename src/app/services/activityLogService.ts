import apiClient from "@/app/utils/apiClient";

const BASE_URL = "/api/v1/logs";

// 내 활동 내역 (페이지)
export const getMyActivityLogs = (page = 0, size = 20) =>
  apiClient.get(`${BASE_URL}/me`, { params: { page, size } });

// 관리자 여부 확인
export const checkAdminAccess = () => apiClient.get(`${BASE_URL}/admin/access`);

// 관리자 전체 활동 조회 (userId/actionType 선택 필터)
export const getAllActivityLogs = (params: {
  targetUserId?: string;
  actionType?: string;
  page?: number;
  size?: number;
}) => apiClient.get(BASE_URL, { params });
