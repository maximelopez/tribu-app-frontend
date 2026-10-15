import { defineConfig } from 'vitest/config';

// Tests du frontend (Vitest)
export default defineConfig({
  test: {
    // Faux navigateur (window, localStorage, document)
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup.ts'],
    // Adresse du backend dans les tests (aucun vrai appel n'est fait)
    env: { VITE_API_URL: 'http://api.test' },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts', 'src/assets/**'],
      // Minimum demandé : en dessous, les tests échouent (CI et Netlify bloqués)
      thresholds: { lines: 75, statements: 75, functions: 70, branches: 65 },
    },
  },
});
