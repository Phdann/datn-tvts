/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Brand Palette
        primary: {
          DEFAULT: '#2563eb', // blue-600
          dark: '#1d4ed8', // blue-700
          light: '#60a5fa', // blue-400
        },
        secondary: {
          DEFAULT: '#1E8E3E',
        },
        accent: {
          DEFAULT: '#2B6CB0',
        },
        // Neutral Grays / Background
        background: {
          DEFAULT: '#ffffff',
          light: '#ffffff',
          gray: '#f9fafb',
        },
      },
      // REMOVED FLAT DESIGN SYSTEM OVERRIDES TO ALLOW ROUNDED CORNERS AND SHADOWS
      /*
      borderRadius: {
        'none': '0',
        'DEFAULT': '0',
        'sm': '0',
        'md': '0',
        'lg': '0',
        'xl': '0',
        '2xl': '0',
        '3xl': '0',
        'full': '0',  // Even "full" is 0 for strict flat design
      },
      // FLAT DESIGN SYSTEM - NO BOX SHADOW
      boxShadow: {
        'none': 'none',
        'DEFAULT': 'none',
        'sm': 'none',
        'md': 'none',
        'lg': 'none',
        'xl': 'none',
        '2xl': 'none',
        'inner': 'none',
      },
      */
      // Typography
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      // Spacing for consistent layout
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Animations
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out',
      },
    },
  },
  plugins: [],
}
