import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Для GitHub Pages: base должен совпадать с именем репозитория
  // Если репозиторий называется taxi-app, то base: '/taxi-app/'
  // Если используешь свой домен, можно поставить '/'
  base: '/taxi-app/',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
