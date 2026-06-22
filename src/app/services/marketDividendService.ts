import { marketAnalysisClient } from '@/app/utils/apiClient';

const BASE_URL = '/api/v1/markets/dividends';

export const getDividendHistory = (stockCd: string) =>
  marketAnalysisClient.get(`${BASE_URL}/${stockCd}`);

export const getRecentDividendHistory = (stockCd: string, limit = 8) =>
  marketAnalysisClient.get(`${BASE_URL}/${stockCd}/recent`, { params: { limit } });

export const getRecentDividendHistoryBatch = (stockCds: string[], limit = 4) =>
  marketAnalysisClient.get(`${BASE_URL}/recent/batch`, { params: { stockCds: stockCds.join(','), limit } });
