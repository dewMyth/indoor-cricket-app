/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pitch: {
          50: '#f1faec',
          100: '#dcf2cd',
          200: '#bce49f',
          300: '#93d268',
          400: '#6cc24a', // primary accent - pitch green
          500: '#54a534',
          600: '#3f8226',
          700: '#326322',
          800: '#2b4f20',
          900: '#26441f',
        },
        stump: {
          400: '#f26d6d',
          500: '#e63946', // wicket/danger red
          600: '#c22733',
        },
        sixer: {
          400: '#ffc94d',
          500: '#f4a300', // six / highlight gold
          600: '#cf8600',
        },
        night: {
          900: '#080d14',
          800: '#0f1720', // base background
          700: '#141c28',
          600: '#1b2434', // surface
          500: '#243044',
          400: '#334159',
          300: '#4c5c78',
        },
      },
      fontFamily: {
        display: ['"Rajdhani"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(108, 194, 74, 0.35)',
        'glow-red': '0 0 20px rgba(230, 57, 70, 0.35)',
      },
      animation: {
        'pulse-fast': 'pulse 0.6s ease-in-out',
        'slide-up': 'slide-up 0.25s ease-out',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
