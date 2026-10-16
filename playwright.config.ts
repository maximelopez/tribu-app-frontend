import { defineConfig, devices } from '@playwright/test';

// Tests système (npm run test:e2e) : l'app complète dans un vrai navigateur, avec le vrai backend.
// Le backend doit être dans le dossier voisin : tribu-app/backend.
const API_PORT = 3100;
const APP_PORT = 5174;

export default defineConfig({
  testDir: 'e2e',
  // Les parcours se suivent un par un (même base de données)
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Pixel 7'], // écran de téléphone
    baseURL: `http://localhost:${APP_PORT}`,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  // Démarre le backend (base en mémoire) puis l'app, avant les tests
  webServer: [
    {
      command: 'npm run start:e2e',
      cwd: '../backend',
      url: `http://localhost:${API_PORT}/health`,
      env: { PORT: String(API_PORT) },
      timeout: 120_000,
      reuseExistingServer: true,
    },
    {
      command: `npx vite --port ${APP_PORT} --strictPort`,
      url: `http://localhost:${APP_PORT}`,
      env: { VITE_API_URL: `http://localhost:${API_PORT}` },
      timeout: 60_000,
      reuseExistingServer: true,
    },
  ],
});
