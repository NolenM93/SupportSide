/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './referral.html', './founder.html'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        /* Canvas */
        base: {
          DEFAULT: '#05070d',
          deep: '#03040a',
          raised: '#0a0f1a',
        },
        /* Text ramp — all AA-compliant on the dark canvas */
        ink: {
          1: '#f4f7ff',
          2: '#c3cede',
          3: '#93a1b8',
        },
        /* Neon accents */
        neon: {
          cyan: '#22d3ee',
          blue: '#60a5fa',
          magenta: '#e879f9',
          violet: '#a78bfa',
        },
        /* Kept so existing brand-* usages stay valid, retuned for dark */
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
      },
      borderColor: {
        hair: 'rgba(255,255,255,0.10)',
        'hair-2': 'rgba(255,255,255,0.16)',
        'hair-3': 'rgba(255,255,255,0.22)',
      },
      backgroundColor: {
        glass: 'rgba(255,255,255,0.04)',
        'glass-2': 'rgba(255,255,255,0.06)',
        'glass-3': 'rgba(255,255,255,0.09)',
      },
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '14px',
        lg: '20px',
      },
      boxShadow: {
        'elev-1': '0 1px 2px rgba(0,0,0,0.4)',
        'elev-2': '0 10px 30px -12px rgba(0,0,0,0.7)',
        'elev-3': '0 24px 60px -20px rgba(0,0,0,0.8)',
        'glow-cyan': '0 0 28px -6px rgba(34,211,238,0.35)',
        'glow-blue': '0 0 28px -6px rgba(96,165,250,0.35)',
        'glow-magenta': '0 0 28px -6px rgba(232,121,249,0.35)',
      },
      transitionTimingFunction: {
        glass: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        250: '250ms',
        280: '280ms',
      },
      keyframes: {
        'fade-rise': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'float-y': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-rise': 'fade-rise 400ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'float-y': 'float-y 7s ease-in-out infinite',
        shimmer: 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
};
