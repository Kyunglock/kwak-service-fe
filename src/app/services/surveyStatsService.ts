import { surveyApiClient } from '@/app/utils/apiClient';

const surveyClient = surveyApiClient;

const BASE_URL = '/api/v1/surveys-stats';

export const getStatsResponses = () => {
  return surveyClient.get(BASE_URL);
};

export const getStatsResponsesPaged = (params?: {
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}) => {
  return surveyClient.get(`${BASE_URL}/paged`, { params });
};
