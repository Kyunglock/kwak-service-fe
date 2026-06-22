import apiClient from '@/app/utils/apiClient';

const BASE_URL = '/api/v1/stocks';

export interface StockWithPrice {
  stockCd: string;
  stockNm: string;
  stockNmKo?: string;
  sector: string;
  sectorKo: string;
  priceDt: string;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  volume: number;
}

// 기업 정보 + 최근 종가 조회
export const getStocksWithPrice = (): Promise<{ data: { data: StockWithPrice[] } }> => {
  return apiClient.get(`${BASE_URL}/price/with-company`);
};
