// ESLint : vérifie la qualité du code (erreurs fréquentes, code inutile, mauvaises pratiques)
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default defineConfig(
  // Fichiers ignorés : code compilé et rapport de couverture
  { ignores: ['dist/', 'dev-dist/', 'coverage/'] },

  // Règles recommandées de JavaScript et de TypeScript
  js.configs.recommended,
  tseslint.configs.recommended,

  // Règles de React : ordre et dépendances des hooks, rechargement à chaud de Vite
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite(),

  {
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Variable inutilisée : erreur, sauf si son nom commence par _ (volontairement ignorée)
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  // Tests : le rechargement à chaud ne les concerne pas
  {
    files: ['tests/**'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
);
