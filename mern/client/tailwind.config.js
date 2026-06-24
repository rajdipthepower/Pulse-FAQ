/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1rem', screens: { '2xl': '1320px' } },
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4338CA',
          50: '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE', 300: '#A5B4FC',
          400: '#818CF8', 500: '#6366F1', 600: '#4F46E5', 700: '#4338CA',
          800: '#3730A3', 900: '#312E81',
        },
        accent: { DEFAULT: '#F59E0B' },
        secondary: { DEFAULT: '#10B981' },
        ink: '#334155',
        canvas: '#F8FAFC',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui'],
        display: ['"Fraunces"', 'ui-serif', 'Georgia'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(67, 56, 202, 0.12)',
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at 20% 0%, rgba(67,56,202,0.18), transparent 40%), radial-gradient(circle at 80% 20%, rgba(16,185,129,0.15), transparent 40%), radial-gradient(circle at 50% 100%, rgba(245,158,11,0.10), transparent 50%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
