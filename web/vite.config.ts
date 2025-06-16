import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,      // 0.0.0.0 でバインド
    port: 5173,      // お好みで
    strictPort: true, // ポート固定
    https: {
      key:  './192.168.0.21+1-key.pem',
      cert: './192.168.0.21+1.pem'
    }
  }
});
