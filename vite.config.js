import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // '/' (root), not the GitHub Pages '/oferta-indra/' subpath — this
  // branch targets Azure Static Web Apps, which serves from the domain
  // root, and the slug-based routing in main.jsx assumes root paths.
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
    // Local dev only: forwards /api/* to a locally-running Azure
    // Functions host (`cd api && npm start`) so useOfferData.js and
    // src/admin/adminApi.js work under `npm run dev` without needing the
    // full Azure Static Web Apps CLI. Has no effect on the production
    // build — SWA's own routing handles /api/* once actually deployed.
    proxy: {
      '/api': 'http://localhost:7071',
    },
  },
});
