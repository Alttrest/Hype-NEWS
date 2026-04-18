/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc', // Light gray background
        surface: '#ffffff', // White card surfaces
        anthracite: '#334155', // Dark slate/anthracite for primary text
        accent: {
          light: '#818cf8',
          DEFAULT: '#6366f1', // Indigo
          dark: '#4f46e5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
