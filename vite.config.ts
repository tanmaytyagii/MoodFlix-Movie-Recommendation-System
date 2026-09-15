/// <reference types="vitest" />
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tmdbHandler from './api/tmdb';
import emotionHandler from './api/emotion';

/**
 * Serve the `api/` serverless functions from the Vite dev server.
 *
 * In production Vercel mounts `api/*.ts` as functions automatically. Without
 * this plugin those routes would 404 in `npm run dev`, so the same handlers are
 * mounted here against Node's own req/res — which satisfy the same structural
 * interface (see `api/_shared.ts`).
 */
const devApiRoutes = (): Plugin => ({
  name: 'moodflix-dev-api',
  configureServer(server) {
    server.middlewares.use('/api/tmdb', (req, res) => {
      void tmdbHandler(req, res);
    });
    server.middlewares.use('/api/emotion', (req, res) => {
      void emotionHandler(req, res);
    });
  },
});

export default defineConfig(({ mode }) => {
  // Load every var (not just VITE_*) into process.env so the dev-mounted API
  // handlers can read the server-side TMDB_TOKEN exactly as they do on Vercel.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    plugins: [react(), devApiRoutes()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}', 'api/**/*.test.ts'],
      restoreMocks: true,
    },
  };
});
