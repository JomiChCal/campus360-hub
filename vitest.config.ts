import path from 'node:path';

import { config as loadEnv } from 'dotenv';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

loadEnv();
loadEnv({ path: '.env.local', override: true });

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
