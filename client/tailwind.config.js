/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { ink: '#111827', paper: '#FFFFFF', accent: '#D8442F' },
      fontFamily: { sans: ['DM Sans', 'Arial', 'sans-serif'], editorial: ['Georgia', 'serif'] },
    },
  },
  plugins: [],
}