/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#7B1818",
        "primary-dim": "#6A1414",
        "primary-container": "#C4962A",
        "on-primary": "#FFFFFF",
        "on-primary-container": "#3D0A0A",
        "secondary": "#A52020",
        "secondary-dim": "#921B1B",
        "secondary-container": "#F5E6C8",
        "on-secondary": "#FFFFFF",
        "on-secondary-container": "#5A1010",
        "tertiary": "#C4962A",
        "tertiary-dim": "#B0841F",
        "tertiary-container": "#F5E6C8",
        "on-tertiary": "#FFFFFF",
        "on-tertiary-container": "#5A3C00",
        "error": "#C0392B",
        "error-dim": "#A93226",
        "error-container": "#FADBD8",
        "on-error": "#FFFFFF",
        "on-error-container": "#6E1010",
        "background": "#FAF7F2",
        "on-background": "#1A1008",
        "surface": "#FAF7F2",
        "on-surface": "#1A1008",
        "surface-variant": "#EDE5D8",
        "on-surface-variant": "#5C4A35",
        "outline": "#8C7355",
        "outline-variant": "#C9B99A",
        "inverse-surface": "#1A1008",
        "inverse-on-surface": "#FAF7F2",
        "inverse-primary": "#F0A0A0",
        "surface-dim": "#E8DDD0",
        "surface-bright": "#FAF7F2",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F5EFE6",
        "surface-container": "#EDE5D8",
        "surface-container-high": "#E5D9C8",
        "surface-container-highest": "#DCCFBA",
      },
      fontFamily: {
        "headline": ["Cairo", "Tajawal", "sans-serif"],
        "body": ["Tajawal", "Cairo", "sans-serif"],
        "label": ["Tajawal", "Cairo", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.375rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "full": "9999px"
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slide-in-left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'float': 'float 3s ease-in-out infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
