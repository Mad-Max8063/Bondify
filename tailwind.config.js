import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{ts,tsx}',
    './contexts/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      scale: {
        '98': '0.98',
      },
      colors: {
        obsidian: {
          DEFAULT: '#0F172A',
          light: '#1E293B',
          dark: '#031427'
        },
        luminous: {
          green: '#10B981',
          amber: '#F59E0B',
          blue: '#64748B'
        }
      }
    }
  },
  plugins: [
    animate,
  ],
};
