/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FBFAEE',
        surface: '#FBFAEE',
        'surface-container-low': '#F5F4E8',
        'surface-container': '#EFEEE3',
        'surface-container-highest': '#E4E3D7',
        primary: '#0F172A', // Deep Navy
        'on-primary': '#FFFFFF',
        'primary-container': '#131B2E',
        secondary: '#D4AF37', // Heritage Gold
        'secondary-fixed': '#FFE088',
        'on-secondary-fixed': '#241A00',
        cream: '#FBFAEE',
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
