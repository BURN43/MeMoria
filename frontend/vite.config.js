import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the root `.env` file
dotenv.config({ path: resolve(__dirname, '../.env') });

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  const backendUrl = isDevelopment ? process.env.VITE_API_BASE_URL_DEV : process.env.VITE_API_BASE_URL_PROD;

  return {
    plugins: [react()],
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
