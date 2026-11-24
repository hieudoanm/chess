import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const ENTRY = process.env.ENTRY ?? 'ui';
const OUT = resolve(__dirname, '.build');

const lib = (entry: string, name: string) => ({
  build: {
    outDir: resolve(OUT, ENTRY),
    emptyOutDir: true,
    publicDir: false,
    lib: { entry: resolve(__dirname, entry), formats: ['iife' as const], name },
    rollupOptions: { output: { entryFileNames: 'index.js' } },
  },
});

export default defineConfig(() => {
  if (ENTRY === 'content')
    return lib('src/content/index.ts', 'ChessUnlockedContent');
  if (ENTRY === 'background')
    return lib('src/background/index.ts', 'ChessUnlockedBackground');
  return {
    build: {
      outDir: resolve(OUT, 'ui'),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'popup.html'),
          options: resolve(__dirname, 'options.html'),
        },
      },
    },
  };
});
