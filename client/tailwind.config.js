/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-purple': '#5A2A83',
        'rich-brown': '#7B4B27',
        'matte-black': '#1C1C1C',
        'accent-beige': '#F5F5DC',
      },
      fontFamily: {
        sans: ['Poppins', 'Nunito Sans', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}

