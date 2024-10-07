import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'process': 'process/browser',
    },
  },
  optimizeDeps: {
    entries: ['./src/**/*.{ts,tsx}'],
    include: ['canvas-confetti'],
  },
  define: {
    'process.env': {},
    'process.browser': true,
    'process.version': JSON.stringify(process.version),
  },
});