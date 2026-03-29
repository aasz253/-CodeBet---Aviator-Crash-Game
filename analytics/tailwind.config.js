/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        danger: '#ef4444',
        success: '#22c55e',
        dark: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569'
        }
      }
    },
  },
  plugins: [],
}
