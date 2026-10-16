/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f7f3eb',
        surface: '#fffdf8',
        'surface-dark': '#2c2925',
        customText: '#2c2925',
        textLight: '#756f66',
        accent: '#8b4a3c',
        accentDark: '#68362d',
        customBorder: '#ded7ca',
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
}