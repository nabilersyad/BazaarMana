/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#1a6b3c',
        gold:   '#c8973a',
        cream:  '#fdf6e9',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body:    ['"Outfit"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}