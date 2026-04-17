import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      canvas: ''
    }
  }
};

export default nextConfig;
