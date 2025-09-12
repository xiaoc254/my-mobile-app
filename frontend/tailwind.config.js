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
          DEFAULT: '#FF6B35',
          50: '#FFF4F0',
          100: '#FFE9E0',
          200: '#FFD2C2',
          300: '#FFBCA3',
          400: '#FFA584',
          500: '#FF6B35',
          600: '#E55A2E',
          700: '#CC4A26',
          800: '#B33B1F',
          900: '#992B17',
        },
        orange: {
          DEFAULT: '#FF6B35',
          light: '#FFA584',
          dark: '#E55A2E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}
