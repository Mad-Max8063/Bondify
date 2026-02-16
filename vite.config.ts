import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const appName = process.env.APP_NAME || env.APP_NAME || 'transit-finder-12';
    const isProduction = mode === 'production';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: [
          `${appName}.preview.emergentagent.com`,
          '.emergentagent.com',
          'localhost',
          '.ngrok.io'
        ],
        hmr: isProduction ? false : {
          host: `${appName}.preview.emergentagent.com`,
          protocol: 'wss'
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
