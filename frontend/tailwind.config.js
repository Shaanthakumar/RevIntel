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
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        navy: {
          800: '#0f172a',
          900: '#0b0f19',
          950: '#060911',
          card: '#1e293b',
          border: '#334155'
        }
      }
    },
  },
  plugins: [],
}
