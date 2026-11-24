import type { NextConfig } from 'next';

const BASE_PATH: string = process.env.BASE_PATH ?? '';

const nextConfig: NextConfig = {
  trailingSlash: true,
  reactCompiler: true,
  reactStrictMode: true,
  output: 'export',
  basePath: BASE_PATH,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
