import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'badge-pop': {
          '0%':   { transform: 'scale(0.7)', opacity: '0' },
          '70%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        shimmer:     'shimmer 1.5s infinite linear',
        'badge-pop': 'badge-pop .35s cubic-bezier(.34,1.56,.64,1) forwards',
      },
    },
  },
  plugins: [],
} satisfies Config
