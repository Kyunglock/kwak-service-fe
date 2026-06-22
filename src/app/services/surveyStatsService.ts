import { surveyApiClient } from '@/app/utils/apiClient';

const surveyClient = surveyApiClient;

const BASE_URL = '/api/v1/surveys-stats';

export const getStatsResponses = () => {
  return surveyClient.get(BASE_URL);
};