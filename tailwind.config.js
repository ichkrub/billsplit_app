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
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0B3B5B',
        },
        secondary: {
          50: '#F7FDF0',
          100: '#E7F9D3',
          200: '#D5F4B6',
          300: '#C2EF99',
          400: '#B0EA7C',
          500: '#9DE55F',
          600: '#7EB74C',
          700: '#5E8939',
          800: '#3F5B26',
          900: '#1F2E13',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 