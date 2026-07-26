/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Poppins"', 'sans-serif'],
        serif: ['"Poppins"', 'sans-serif'],
      },
      colors: {
        gold: {
          300: '#f3e5ab',
          400: '#e5c158',
          500: '#d4af37',
          600: '#aa7c11',
          700: '#8b6508',
        },
        dark: {
          900: '#0a0a0c',
          800: '#121318',
          700: '#1a1c23',
          600: '#252833',
        },
      },
    },
  },
  plugins: [],
};
