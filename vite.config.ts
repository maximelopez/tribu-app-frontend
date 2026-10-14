import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Le service worker se met à jour tout seul à chaque nouvelle version déployée
      registerType: 'autoUpdate',
      includeAssets: ['favicon-64x64.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Tribu',
        short_name: 'Tribu',
        description: 'Des activités en famille, hors écran.',
        lang: 'fr',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F3F3F8',
        theme_color: '#00a16d',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Hors ligne basique : l'app (écrans, polices, images) est mise en cache.
        // Les appels au serveur (API, socket) restent toujours en ligne.
        globPatterns: ['**/*.{js,css,html,png,svg,ttf,otf,woff2}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
});
