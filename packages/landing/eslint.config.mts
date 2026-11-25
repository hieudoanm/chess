import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'node_modules/**',
    'public/**',
    'out/**',
    'build/**',
    'coverage/**',
    'test-results/**',
    'playwright-report/**',
    'videos/**',
    'next-env.d.ts',
  ]),
]);
