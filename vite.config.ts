import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// API 주소는 전부 VITE_* 환경변수로 주입한다 (src/app/utils/apiClient.ts 참고).
// 배포 시에는 nginx.conf 가 /api, /portal, /survey, /advisor, /market 을
// api-gateway 로 프록시하므로 별도 dev 프록시 설정은 두지 않는다.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
  },
});
