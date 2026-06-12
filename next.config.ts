import type { NextConfig } from 'next';

const noStoreHeaders = [
  { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
  { key: 'Pragma', value: 'no-cache' },
  { key: 'Expires', value: '0' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/api/schedule-config',
        headers: noStoreHeaders,
      },
      {
        source: '/api/business-hours-state',
        headers: noStoreHeaders,
      },
    ];
  },
};

export default nextConfig;
