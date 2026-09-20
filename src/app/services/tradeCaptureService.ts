import apiClient from "@/app/utils/apiClient";
import type {
  ApiResponse,
  TradeConfirmItem,
  TradeConfirmResponse,
  TradeDraftResponse,
} from "@/app/types";

const BASE_URL = "/api/v1/trades/capture";

/**
 * 문장에서 매매 내역 추출 — 저장하지 않고 초안만 돌려받는다.
 * 실제 저장은 사용자가 확인한 뒤 confirmTradeDraft 로 이뤄진다.
 */
export const captureTradeText = (portfolioId: number, text: string) => {
  return apiClient.post<ApiResponse<TradeDraftResponse>>(`${BASE_URL}/text`, {
    portfolioId,
    text,
  });
};

/** 증권사 화면 캡처에서 매매 내역 추출 (png/jpeg/webp/gif, 4MB 이하). */
export const captureTradeImage = (portfolioId: number, image: File) => {
  const form = new FormData();
  form.append("image", image);
  return apiClient.post<ApiResponse<TradeDraftResponse>>(
    `${BASE_URL}/image`,
    form,
    {
      params: { portfolioId },
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
};

/** 사용자가 확인·수정한 항목을 실제 거래내역으로 저장. */
export const confirmTradeDraft = (
  draftId: string,
  items: TradeConfirmItem[],
) => {
  return apiClient.post<ApiResponse<TradeConfirmResponse>>(
    `${BASE_URL}/confirm`,
    { draftId, items },
  );
};
