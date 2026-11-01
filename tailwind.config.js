/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#245C45',
          50: '#E6F3E9',
          100: '#C3E0CB',
          200: '#9DCCB0',
          300: '#77B895',
          400: '#51A47A',
          500: '#245C45',
          600: '#1E4D3A',
          700: '#183D2E',
          800: '#122D22',
          900: '#0C1E17',
        },
        secondary: {
          DEFAULT: '#6FAF83',
          light: '#9FCBAD',
          dark: '#4A8A5F',
        },
        mint: '#E6F3E9',
        cream: '#FAF8F0',
        darkText: '#24352B',
        muted: '#78847B',
        warning: '#F2B84B',
        error: '#D9534F',
        success: '#4CAF50',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        card: '0 4px 20px rgba(36, 92, 69, 0.08)',
        'card-hover': '0 8px 30px rgba(36, 92, 69, 0.15)',
        glow: '0 0 20px rgba(111, 175, 131, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-green': 'pulseGreen 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseGreen: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}
