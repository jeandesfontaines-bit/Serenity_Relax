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
        sans: ['var(--font-jakarta)', 'Inter', 'sans-serif'],
        serif: ['"Noto Serif"', 'serif'],
        display: ['var(--font-jakarta)', 'Inter', 'sans-serif'],
        headline: ['var(--font-jakarta)', 'Inter', 'sans-serif'],
        label: ['var(--font-jakarta)', 'Inter', 'sans-serif'],
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
          DEFAULT: '#6366F1',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#A3E635',
          foreground: '#1F2937',
        },
        accent: {
          DEFAULT: '#EEF2FF',
          foreground: '#4338CA',
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
        'on-surface': '#1F2937',
        'on-surface-variant': '#64748B',
        'outline-variant': '#CBD5E1',
        'surface-container': '#F1F5F9',
        'surface-container-low': '#F8FAFC',
        'surface-container-lowest': '#ffffff',
        'surface-container-highest': '#E2E8F0',
        'primary-fixed': '#E0E7FF',
        'primary-container': '#4F46E5',
        'on-primary-container': '#EEF2FF',
        'secondary-container': '#ECFCCB',
        'on-secondary-container': '#3F6212',
        'on-tertiary-container': '#9D174D',
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
