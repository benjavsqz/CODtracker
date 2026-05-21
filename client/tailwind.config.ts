import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:      '#06060a',
          surface: '#0d0d14',
          card:    '#10101a',
          border:  '#1a1a2e',
        },
      },
      backgroundImage: {
        'grid-dark': "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
        'glow-green': 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(74,222,128,.12) 0%, transparent 70%)',
        'glow-center': 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(74,222,128,.05) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      boxShadow: {
        'glow-s':  '0 0 20px rgba(250,204,21,.15), 0 0 60px rgba(250,204,21,.05)',
        'glow-a':  '0 0 20px rgba(74,222,128,.15), 0 0 60px rgba(74,222,128,.05)',
        'glow-b':  '0 0 20px rgba(96,165,250,.15), 0 0 60px rgba(96,165,250,.05)',
        'glow-c':  '0 0 20px rgba(156,163,175,.08)',
        'glow-sm-s': '0 0 12px rgba(250,204,21,.25)',
        'glow-sm-a': '0 0 12px rgba(74,222,128,.25)',
        'glow-sm-b': '0 0 12px rgba(96,165,250,.25)',
        'card':    '0 4px 24px rgba(0,0,0,.4)',
        'panel':   '-8px 0 40px rgba(0,0,0,.6)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.5' },
        },
        'badge-pop': {
          '0%':   { transform: 'scale(0.7)', opacity: '0' },
          '70%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        shimmer:      'shimmer 1.5s infinite linear',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'badge-pop':  'badge-pop .35s cubic-bezier(.34,1.56,.64,1) forwards',
        float:        'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
