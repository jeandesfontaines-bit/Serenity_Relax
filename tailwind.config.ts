import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        serif: ['"Noto Serif"', 'serif'],
        display: ['"Public Sans"', 'sans-serif'],
        headline: ['"Public Sans"', 'sans-serif'],
        label: ['Manrope', 'sans-serif'],
        cursive: ['"Meow Script"', 'cursive'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: '#435544', // Sage Green
          foreground: '#faf9f7',
        },
        secondary: {
          DEFAULT: '#725a38', // Warm Wood
          foreground: '#faf9f7',
        },
        accent: {
          DEFAULT: '#faf9f7', // Soft Sand
          foreground: '#435544',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        'on-surface': '#1a1c1b',
        'on-surface-variant': '#434842',
        'outline-variant': '#c3c8c0',
        'surface-container': '#efeeec',
        'surface-container-low': '#f4f3f1',
        'surface-container-lowest': '#ffffff',
        'surface-container-highest': '#e3e2e0',
        'primary-fixed': '#d4e8d2',
        'primary-container': '#5b6d5b',
        'on-primary-container': '#daeed8',
        'secondary-container': '#fcdaaf',
        'on-secondary-container': '#775e3c',
        'on-tertiary-container': '#775e3c',
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '400' }],
        'headline-lg': ['32px', { lineHeight: '1.3', fontWeight: '400' }],
        'headline-md': ['24px', { lineHeight: '1.4', fontWeight: '400' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '600' }],
        'label-sm': ['12px', { lineHeight: '1.2', letterSpacing: '0.03em', fontWeight: '500' }],
        'label-xs': ['10px', { lineHeight: '1.0', letterSpacing: '0.6em', fontWeight: '400' }],
      },
      spacing: {
        'margin-edge': '64px',
        'unit': '8px',
        'section-padding': '120px',
        'gutter': '24px',
        'margin': '32px',
        'sm-token': '12px',
        'xs-token': '4px',
        'lg-token': '48px',
        'xl-token': '80px',
        'md-token': '24px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
