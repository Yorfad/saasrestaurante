/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff5f5',
          100: '#ffe3e3',
          500: '#c0392b',
          600: '#a93226',
          700: '#922b21',
        },
      },
    },
  },
  plugins: [],
}
