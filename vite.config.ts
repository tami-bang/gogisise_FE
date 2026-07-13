import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    // TODO: Add vite-plugin-obfuscator here for E2EE logic protection in production
  ],
  build: {
    // 보안: 프로덕션 빌드 시 소스코드 역공학 방지를 위해 소스맵 비활성화
    sourcemap: false,
  }
})
