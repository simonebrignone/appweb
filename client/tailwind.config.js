export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    colors: {
      primary: { DEFAULT: '#0f172a' },
      secondary: { DEFAULT: '#1e293b' },
      accent: { DEFAULT: '#38bdf8' },
      background: { DEFAULT: '#0a0a0a' },
      white: '#ffffff',
    },
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

