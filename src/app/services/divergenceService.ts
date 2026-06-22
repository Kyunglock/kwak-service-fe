import { stockAdvisorApiClient as apiClient } from '@/app/utils/apiClient';
import type { DivergenceResultResponse, DivergenceInterpretationResponse } from '@/app/types';

const BASE = '/api/v1/divergences';

export const getDivergenceResults = (stockCd: string) =>
  apiClient.get<DivergenceResultResponse[]>(`${BASE}/stocks/${stockCd}`);

export const getDivergenceInterpretations = (stockCd: string) =>
  apiClient.get<DivergenceInterpretationResponse[]>(`${BASE}/stocks/${stockCd}/interpretations`);
