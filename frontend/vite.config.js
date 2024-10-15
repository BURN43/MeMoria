import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  const backendUrl = isDevelopment ? process.env.VITE_API_BASE_URL_DEV : process.env.VITE_API_BASE_URL_PROD;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        'qrcode.react': path.resolve(__dirname, 'node_modules/qrcode.react'),
      },
    },
    optimizeDeps: {
      include: ['qrcode.react'], // Ensure `qrcode.react` is pre-bundled for faster load
    },
    build: {
      rollupOptions: {
        external: [], // Keep empty or remove if no external modules needed
      },
    },
    server: {
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/socket.io': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  };
});
