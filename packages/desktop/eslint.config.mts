import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
  globalIgnores([
    '.next/**',
    'build/**',
    'jest.config.ts',
    'jest.setup.ts',
    'next-env.d.ts',
    'node_modules/**',
    'out/**',
    'src-tauri/**',
    'src-tauri/target/**',
  ]),
]);

export default eslintConfig;
