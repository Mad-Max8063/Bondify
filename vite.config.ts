import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const isProduction = mode === 'production';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Same-origin en dev: el frontend pega a /api y Vite lo reenvía al
        // backend local, así las cookies de sesión fluyen sin CORS.
        proxy: {
          '/api': 'http://localhost:8001',
        },
      },
      plugins: [react()],
      // Sin console/debugger en el bundle de producción
      esbuild: isProduction ? { drop: ['console', 'debugger'] } : undefined,
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
