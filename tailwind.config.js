/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./config/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#050505",
          surface: "#0D0D0F",
          card: "#121215",
          cardHover: "#18181D",
          border: "#1E1E24",
          borderLight: "#2A2A33",
          primary: "#FF3B30",
          primaryGlow: "#FF3B3033",
          orange: "#FF7A00",
          orangeGlow: "#FF7A0033",
          muted: "#9A9A9A",
          mutedDark: "#52525B",
          text: "#F4F4F5",
        }
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Orbitron"', '"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      boxShadow: {
        'glow-red': '0 0 25px -5px rgba(255, 59, 48, 0.4)',
        'glow-orange': '0 0 25px -5px rgba(255, 122, 0, 0.4)',
        'cyber': '0 0 0 1px rgba(255, 59, 48, 0.2), 0 8px 24px -4px rgba(0, 0, 0, 0.8)',
      }
    },
  },
  plugins: [],
}
