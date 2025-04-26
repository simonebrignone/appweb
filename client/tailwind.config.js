/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: '#0f172a', // blu notte
          secondary: '#1e293b', // blu più chiaro
          accent: '#38bdf8', // azzurro acceso
          background: '#0a0a0a', // nero profondo
          white: '#ffffff',
        },
      },
    },
    plugins: [],
  }
  