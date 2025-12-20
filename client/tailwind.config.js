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
        'matte-black': '#0F0F0F', // Darker for better contrast
        'accent-beige': '#F5F5DC',
        'glass-black': 'rgba(20, 20, 20, 0.7)',
        'neon-purple': '#B026FF',
        'neon-blue': '#00FFFF',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        sans: ['Outfit', 'Poppins', 'sans-serif'], // Updated font stack
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(176, 38, 255, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(176, 38, 255, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}

