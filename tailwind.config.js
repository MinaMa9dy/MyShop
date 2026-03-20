/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#0050d4",
        "primary-dim": "#0046bb",
        "primary-container": "#7b9cff",
        "on-primary": "#f1f2ff",
        "on-primary-container": "#001e5a",
        "secondary": "#4850b7",
        "secondary-dim": "#3b43aa",
        "secondary-container": "#cbceff",
        "on-secondary": "#f3f1ff",
        "on-secondary-container": "#323aa2",
        "tertiary": "#8e3a8a",
        "tertiary-dim": "#802d7d",
        "tertiary-container": "#fe9cf4",
        "on-tertiary": "#ffeef8",
        "on-tertiary-container": "#661466",
        "error": "#b31b25",
        "error-dim": "#9f0519",
        "error-container": "#fb5151",
        "on-error": "#ffefee",
        "on-error-container": "#570008",
        "background": "#f5f6f7",
        "on-background": "#2c2f30",
        "surface": "#f5f6f7",
        "on-surface": "#2c2f30",
        "surface-variant": "#dadddf",
        "on-surface-variant": "#595c5d",
        "outline": "#757778",
        "outline-variant": "#abadae",
        "inverse-surface": "#0c0f10",
        "inverse-on-surface": "#9b9d9e",
        "inverse-primary": "#618bff",
        "surface-dim": "#d1d5d7",
        "surface-bright": "#f5f6f7",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff1f2",
        "surface-container": "#e6e8ea",
        "surface-container-high": "#e0e3e4",
        "surface-container-highest": "#dadddf",
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "1rem",
        "2xl": "1.5rem",
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
        }
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slide-in-left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.3s ease-out',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}

