import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#730021',
          soft: 'rgba(115, 0, 33, 0.07)',
          mid: 'rgba(115, 0, 33, 0.12)',
          dark: '#5c001a',
        },
        secondary: '#E3D5B8',
        bg: '#F8F7F5',
        card: '#FFFFFF',
        'text-base': '#1F1F1F',
        'text-muted': '#8A8A8A',
        'text-light': '#B8B8B8',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
        md: '0 4px 16px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.03)',
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
      },
      borderRadius: {
        DEFAULT: '14px',
        sm: '8px',
        xl: '0.75rem',
        '2xl': '1rem',
      },
      border: {
        DEFAULT: 'rgba(0,0,0,0.07)',
        strong: 'rgba(0,0,0,0.11)',
      },
    },
  },
  plugins: [],
}

export default config