/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fdf0',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#14a800',
          600: '#108a00',
          700: '#0e7a00',
          800: '#065f00',
          900: '#064e00',
        },
        dark: '#001e00',
      },
    },
  },
  plugins: [],
}
