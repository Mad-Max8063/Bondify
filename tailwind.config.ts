import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
import { INK, LED, SEMANTIC } from './config/designTokens';

export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{ts,tsx}',
    './contexts/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    // Los divIcons de Leaflet generan clases dentro de strings:
    './utils/**/*.ts',
    './config/**/*.ts',
  ],
  theme: {
    extend: {
      colors: {
        ink: INK,
        led: { ...LED, DEFAULT: LED[400] },
        ok: { DEFAULT: SEMANTIC.ok, dim: SEMANTIC.okDim },
        danger: { DEFAULT: SEMANTIC.danger, dim: SEMANTIC.dangerDim },
        gps: SEMANTIC.gps,
      },
      fontFamily: {
        sans: ['"Outfit Variable"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        field: '0.75rem', // inputs y botones
        card: '1rem', // cards
        sheet: '1.5rem', // bottom sheets y modales
      },
      boxShadow: {
        raised: 'inset 0 1px 0 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.45)',
        sheet: 'inset 0 1px 0 0 rgba(255,255,255,0.06), 0 -12px 32px rgba(0,0,0,0.5)',
        pop: 'inset 0 1px 0 0 rgba(255,255,255,0.06), 0 16px 48px rgba(0,0,0,0.6)',
        fab: '0 4px 16px rgba(0,0,0,0.5)',
      },
      zIndex: {
        map: '0',
        chrome: '10',
        sheet: '20',
        nav: '30',
        banner: '40',
        overlay: '50',
        alert: '60',
        toast: '70',
      },
      transitionTimingFunction: {
        fluid: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        rise: 'rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      scale: {
        '98': '0.98',
      },
    },
  },
  plugins: [animate],
} satisfies Config;
