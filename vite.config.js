import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// fuerza runtime automático:
export default defineConfig({
  plugins: [
    react({ jsxRuntime: 'automatic' })
  ]
});
