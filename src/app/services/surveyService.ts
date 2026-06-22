import { surveyApiClient } from '@/app/utils/apiClient';
import type { SurveySubmitRequest } from '@/app/types';

const surveyClient = surveyApiClient;

const BASE_URL = '/api/v1/surveys';

// ========== 설문 관리 ==========

// 설문 목록 조회
export const getSurveys = () => {
  return surveyClient.get(BASE_URL);
};

// 설문 등록
export const addSurvey = (data: { surveyName: string; description?: string; surveyType?: string }) => {
  return surveyClient.post(BASE_URL, data);
};

// 설문 상세 조회 (문항 포함)
export const getSurvey = (surveyId: number) => {
  return surveyClient.get(`${BASE_URL}/${surveyId}`);
};

// 설문 수정
export const modifySurvey = (surveyId: number, data: { surveyName?: string; description?: string; surveyType?: string }) => {
  return surveyClient.put(`${BASE_URL}/${surveyId}`, data);
};

// 설문 삭제
export const removeSurvey = (surveyId: number) => {
  return surveyClient.delete(`${BASE_URL}/${surveyId}`);
};

// 문항 목록 조회
export const getSurveyQuestions = (surveyId: number) => {
  return surveyClient.get(`${BASE_URL}/${surveyId}/questions`);
};

// 문항 등록
export const addSurveyQuestion = (surveyId: number, data: { questionText: string; questionType?: string; description?: string; sortOrder?: number }) => {
  return surveyClient.post(`${BASE_URL}/${surveyId}/questions`, data);
};

// 문항 삭제
export const removeSurveyQuestion = (questionId: number) => {
  return surveyClient.delete(`${BASE_URL}/questions/${questionId}`);
};

// ========== 설문 응답 ==========

// 설문 제출
export const submitSurvey = (data: SurveySubmitRequest) => {
  return surveyClient.post(`${BASE_URL}/submit`, data);
};

// 내 설문 응답 이력 조회
export const getMyResponses = () => {
  return surveyClient.get(`${BASE_URL}/responses`);
};

// 특정 설문 결과 조회 (집계)
export const getSurveyResults = (surveyId: number) => {
  return surveyClient.get(`${BASE_URL}/${surveyId}/results`);
};

// 내 전체 설문 결과 조회
export const getAllSurveyResults = () => {
  return surveyClient.get(`${BASE_URL}/results`);
};

export const getMySurveyResponse = (surveyId: number, responseId: number) => {
  return surveyClient.get(`${BASE_URL}/${surveyId}/response/${responseId}`);
}

export const getOptionStats = (surveyId: number, responseId: number) => {
  return surveyClient.get(`${BASE_URL}/${surveyId}/response/${responseId}/options-stats`);
}

export const getSurveyWithMyResponses = () => {
  return surveyClient.get(`${BASE_URL}/with-my-responses`)
}