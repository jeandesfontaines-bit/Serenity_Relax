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
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"DM Serif Display"', 'serif'],
        cursive: ['"Meow Script"', 'cursive'],
        code: ['monospace'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
        body: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display': ['3.052rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'h1': ['2.441rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'h2': ['1.953rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'h3': ['1.563rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'h4': ['1.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'body-lg': ['1.118rem', { lineHeight: '1.6', letterSpacing: '0em' }],
        'body': ['1rem', { lineHeight: '1.6', letterSpacing: '0em' }],
        'small': ['0.8rem', { lineHeight: '1.6', letterSpacing: '0em' }],
        'code': ['0.894rem', { lineHeight: '1.6', letterSpacing: '0em' }]
      },
      lineHeight: {
        heading: '1.15',
        body: '1.6',
      },
      letterSpacing: {
        heading: '-0.02em',
        body: '0em',
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
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
          background: 'hsl(var(--success-background))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
          background: 'hsl(var(--warning-background))',
        },
        danger: {
          DEFAULT: 'hsl(var(--danger))',
          foreground: 'hsl(var(--danger-foreground))',
          background: 'hsl(var(--danger-background))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
          background: 'hsl(var(--info-background))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // --- EARTH PALETTE ---
        squash: 'var(--c-squash)',
        mandarin: 'var(--c-mandarin)',
        azraq: 'var(--c-azraq)',
        dupain: 'var(--c-dupain)',
        aurora: 'var(--c-aurora)',
        iceland: 'var(--c-iceland)',
        tomato: 'var(--c-tomato)',
        yueguang: 'var(--c-yueguang)',
        samaritan: 'var(--c-samaritan)',
        water: 'var(--c-water)',
        carrot: 'var(--c-carrot)',
        jalapeno: 'var(--c-jalapeno)',
        sapphire: 'var(--c-sapphire)',
        forest: 'var(--c-forest)',
        reef: 'var(--c-reef)',
        'bg-soft': 'var(--bg-soft)',
        'border-light': 'var(--border-light)',
      },
      spacing: {
        'xxs': 'var(--space-xxs)',
        'xs': 'var(--space-xs)',
        's': 'var(--space-s)',
        'm': 'var(--space-m)',
        'l': 'var(--space-l)',
        'xl': 'var(--space-xl)',
        'xxl': 'var(--space-xxl)',
        'xxxl': 'var(--space-xxxl)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'var(--radius-m)',
        sm: 'var(--radius-s)',
        xl: 'var(--radius-l)',
        'card-inner': 'calc(var(--radius) - 8px)',
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
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
