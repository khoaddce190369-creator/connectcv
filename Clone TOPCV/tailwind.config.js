/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        topcv: {
          green: '#00b14f',
          darkgreen: '#008b3e',
          lightgreen: '#e6f7ee',
          gray: '#f4f5f5',
          dark: '#1e2633',
          border: '#e9eaec',
        }
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        opensans: ['Open Sans', 'sans-serif'],
        merriweather: ['Merriweather', 'serif'],
        bevietnam: ['Be Vietnam Pro', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
