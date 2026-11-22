/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        graphite: {
          50: '#f6f7f9',
          100: '#edeff2',
          200: '#d8dce2',
          300: '#b6bdc9',
          400: '#8e99aa',
          500: '#6f7b8f',
          600: '#566072',
          700: '#434b5a',
          800: '#2a303c',
          850: '#1e232b',
          900: '#14171d',
          950: '#0c0e12',
        },
        hunter: {
          lime: '#9ae600',
          'lime-dim': '#7cb800',
          'lime-dark': '#4d7500',
          amber: '#f59e0b',
          'amber-glow': 'rgba(245, 158, 11, 0.15)',
          racing: '#10b981',
          silver: '#94a3b8',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'sans-serif'
        ],
        mono: [
          'JetBrains Mono',
          'SF Mono',
          'Menlo',
          'Consolas',
          'monospace'
        ],
      },
      boxShadow: {
        'dial': '0 0 30px -5px rgba(154, 230, 0, 0.15)',
        'dial-amber': '0 0 30px -5px rgba(245, 158, 11, 0.2)',
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.25)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'card-light': '0 4px 20px -2px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
