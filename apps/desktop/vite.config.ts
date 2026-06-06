import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import electronRenderer from 'vite-plugin-electron-renderer';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'src/main/index.ts',
        vite: {
          build: {
            outDir: 'dist-electron/main',
            rollupOptions: {
              external: ['better-sqlite3', 'electron', 'tesseract.js'],
            },
          },
          resolve: {
            alias: {
              '@copilot/shared': path.resolve(__dirname, '../../packages/shared/src'),
            },
          },
        },
      },
      {
        entry: 'src/preload/index.ts',
        vite: {
          build: {
            outDir: 'dist-electron/preload',
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
        onstart(args) {
          args.reload();
        },
      },
    ]),
    electronRenderer(),
  ],
  resolve: {
    alias: {
      '@copilot/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
