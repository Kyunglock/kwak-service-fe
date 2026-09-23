import { defineConfig, devices } from '@playwright/test';

// 백엔드 없이 도는 스모크 테스트다. 인증이 필요 없는 화면과,
// 쿠키가 없을 때의 리다이렉트/에러 처리만 검증한다.
// 빌드 산출물(dist)을 vite preview 로 띄워 실제 브라우저에서 확인하므로
// ESLint·타입체크가 잡지 못하는 라우팅 깨짐과 런타임 크래시를 잡는다.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run preview',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
