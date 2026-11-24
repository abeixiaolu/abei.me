import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { fileRoutes } from 'filesystem-routing/vite';
import { defineConfig } from 'vitest/config';
import solid from '@solidjs/vite-plugin';
import { contentPlugin } from './vite/content-plugin.ts';

export default defineConfig({
  plugins: [
    solid({ start: true, extensions: ['.jsx', '.tsx'], diagnostics: true }),
    fileRoutes({ types: true }),
    contentPlugin(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '~': path.resolve(import.meta.dirname, 'src'),
    },
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./vitest-setup.ts'],
    isolate: false,
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 0,
  },
});
