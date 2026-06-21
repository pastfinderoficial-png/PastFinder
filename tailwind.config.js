/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#D9A036',
        surface: '#D9A036',
        'surface-container-low': '#CCA01D',
        'surface-container': '#C4981C',
        'surface-container-highest': '#B58B19',
        primary: '#0F172A', // Deep Navy
        'on-primary': '#FFFFFF',
        'primary-container': '#131B2E',
        secondary: '#D4AF37', // Heritage Gold
        'secondary-fixed': '#FFE088',
        'on-secondary-fixed': '#241A00',
        cream: '#D9A036',
        navy: '#0F172A',
        gold: '#D4AF37'
      },
      fontFamily: {
        newsreader: ['Newsreader', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'ambient': '0 40px 60px -15px rgba(27, 28, 21, 0.05)',
      }
    },
  },
  plugins: [],
}
