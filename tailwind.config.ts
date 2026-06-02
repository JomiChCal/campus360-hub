import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'utpl-navy': '#0d2e5c',
        'utpl-navy-medium': '#12407a',
        'utpl-navy-light': '#1a5296',
        'utpl-gold': '#f5c842',
        'utpl-gold-light': '#fff8e1',
        'utpl-surface': '#f4f6fa',
        'utpl-text': '#1e293b',
        'utpl-muted': '#64748b',
        'utpl-border': '#e2e8f0',
        'utpl-success': '#0d9488',
        'utpl-blue': '#004270',
        'utpl-blue-hover': '#003358',
        'prestige-navy': '#0a1628',
        'prestige-night': '#1a365d',
        'prestige-gold': '#d4a853',
        'prestige-gold-light': '#f5e6c8',
        'prestige-surface': '#f8fafc',
        'prestige-border': 'rgba(212, 168, 83, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;