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
          50:  '#f0f7ff',
          100: '#e0efff',
          200: '#b9dfff',
          300: '#7cc8f6',
          400: '#4FB5E2',
          500: '#2196F3',
          600: '#1976D2',
          700: '#1565C0',
          800: '#1B3A5C',
          900: '#152D48',
        },
        dark: '#1B3654',
      },
    },
  },
  plugins: [],
}
