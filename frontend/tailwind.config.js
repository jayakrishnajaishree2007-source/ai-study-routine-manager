/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#edd8ff',
          200: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#090514', // deep dark violet
        },
        darkbg: {
          sidebar: '#0e0b1e',
          body: '#05020c',
          card: '#130e29',
          border: '#231b42'
        }
      },
    },
  },
  plugins: [],
}
