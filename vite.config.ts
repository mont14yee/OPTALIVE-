import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  // Ensure no credentials or process.env keys are defined for browser bundles
  define: {},
  build: {
    sourcemap: false, // Prevent source-map leakage
    chunkSizeWarningLimit: 1000
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});
