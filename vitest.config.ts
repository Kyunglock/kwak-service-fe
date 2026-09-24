import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

// 순수 로직(questionIntent.ts 등)의 유닛테스트 전용. Playwright E2E(e2e/)는
// 별도 러너(playwright.config.ts)가 돌리므로 여기서는 명시적으로 제외한다 —
// 같은 프로젝트에 vitest 와 @playwright/test 의 test()/describe() 전역이
// 동시에 있으면 vitest 가 e2e 스펙을 잘못 집어 충돌한다.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
