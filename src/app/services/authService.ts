import apiClient from '@/app/utils/apiClient';

export const kakaoLogin = () => {
  return apiClient.get('/api/v1/auth/kakao/login');
};

export const standardLogin = (email: string, password: string) => {
  return apiClient.post('/api/v1/auth/standard/login', { email, password });
};

export const guestLogin = () => {
  return apiClient.post('/api/v1/auth/guest/login');
};

export const logout = () => {
  return apiClient.post('/api/v1/auth/logout');
};

export const refreshToken = () => {
  return apiClient.post('/api/v1/auth/refresh');
};
