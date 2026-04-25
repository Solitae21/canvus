// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './client/**/*.{ts,tsx}',
  ],
  darkMode: 'class',   // enables dark mode via a CSS class
  theme: {
    extend: {
      colors: {
        // ── Surface palette ──
        surface: {
          DEFAULT:              '#0c1324',
          dim:                  '#0c1324',
          bright:               '#33394c',
          'container-lowest':   '#070d1f',
          'container-low':      '#151b2d',
          container:            '#191f31',
          'container-high':     '#23293c',
          'container-highest':  '#2e3447',
          tint:                 '#b0c6ff',
          variant:              '#2e3447',
        },
        'on-surface': {
          DEFAULT: '#dce1fb',
          variant: '#c2c6d8',
        },
        'inverse-surface':    '#dce1fb',
        'inverse-on-surface': '#2a3043',
        outline: {
          DEFAULT: '#8c90a1',
          variant: '#424655',
        },

        // ── Primary ──
        primary: {
          DEFAULT:      '#b0c6ff',
          container:    '#568dff',
          fixed:        '#d9e2ff',
          'fixed-dim':  '#b0c6ff',
        },
        'on-primary': {
          DEFAULT:         '#002d6f',
          container:       '#002661',
          fixed:           '#001945',
          'fixed-variant': '#00429c',
        },
        'inverse-primary': '#0058cb',

        // ── Secondary ──
        secondary: {
          DEFAULT:      '#bec6e0',
          container:    '#3f465c',
          fixed:        '#dae2fd',
          'fixed-dim':  '#bec6e0',
        },
        'on-secondary': {
          DEFAULT:         '#283044',
          container:       '#adb4ce',
          fixed:           '#131b2e',
          'fixed-variant': '#3f465c',
        },

        // ── Tertiary ──
        tertiary: {
          DEFAULT:      '#bcc7de',
          container:    '#8691a7',
          fixed:        '#d8e3fb',
          'fixed-dim':  '#bcc7de',
        },
        'on-tertiary': {
          DEFAULT:         '#263143',
          container:       '#1f2a3c',
          fixed:           '#111c2d',
          'fixed-variant': '#3c475a',
        },

        // ── Error ──
        error: {
          DEFAULT:   '#ffb4ab',
          container: '#93000a',
        },
        'on-error': {
          DEFAULT:   '#690005',
          container: '#ffdad6',
        },

        // ── Background ──
        background:      '#0c1324',
        'on-background': '#dce1fb',
      },

      // ── Typography ──
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-xl':  ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-lg':     ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md':     ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm':     ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-md':    ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
        'label-sm':    ['10px', { lineHeight: '12px', letterSpacing: '0.08em', fontWeight: '700' }],
      },

      // ── Border radius ──
      borderRadius: {
        sm:   '0.25rem',
        md:   '0.75rem',
        lg:   '1rem',
        xl:   '1.5rem',
        full: '9999px',
      },

      // ── Spacing tokens ──
      spacing: {
        xs:     '4px',
        sm:     '8px',
        md:     '16px',
        lg:     '24px',
        xl:     '40px',
        gutter: '16px',
        margin: '24px',
      },

      // ── Box shadows (glass / glow) ──
      boxShadow: {
        glow:  '0 0 15px rgba(176, 198, 255, 0.20)',
        glass: '0 4px 30px rgba(0, 0, 0, 0.30)',
        modal: '0 25px 60px rgba(0, 0, 0, 0.50)',
      },

      // ── Backdrop blur ──
      backdropBlur: {
        glass: '20px',
        heavy: '40px',
      },
    },
  },
  plugins: [],
}

export default config