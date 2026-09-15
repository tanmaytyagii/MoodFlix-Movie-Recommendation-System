/** @type {import('tailwindcss').Config} */

/**
 * MoodFlix design tokens.
 *
 * Every colour, radius, shadow and duration the UI uses is defined here so
 * components reference intent ("surface-raised", "ink-muted") rather than raw
 * palette steps. Values are literal hex rather than CSS variables so Tailwind's
 * opacity modifiers (`bg-surface/60`) keep working.
 *
 * The product is dark-only by design — it is a cinema room, not a document.
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Page background. Near-black with a trace of warmth so posters sit on
        // it without the blue cast a pure-grey scale gives.
        canvas: '#0A0A0C',

        surface: {
          DEFAULT: '#131317', // cards
          raised: '#1B1B21', // panels, inputs
          hover: '#24242B', // interactive hover
          sunken: '#0F0F12', // inset areas, inputs on cards
        },

        line: {
          DEFAULT: '#26262E', // hairlines
          strong: '#383842', // emphasised dividers, input borders
        },

        ink: {
          DEFAULT: '#F7F7F8', // primary text
          muted: '#A5A5B0', // secondary text
          faint: '#85858F', // metadata, captions — 5.4:1 on canvas, AA at 11px
        },

        // Single accent, used sparingly: active nav, primary action, ratings,
        // focus rings. Warm gold reads cinematic without the acid of yellow-500.
        accent: {
          DEFAULT: '#E8B33E',
          strong: '#F3C462',
          contrast: '#1A1305', // text on an accent fill
          soft: 'rgba(232, 179, 62, 0.12)',
        },

        positive: '#4ADE80',
        caution: '#FBBF24',
        critical: '#F87171',
      },

      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },

      // Fluid type: scales with the viewport so headings stay cinematic on a
      // desktop and stay readable at 320px without a pile of breakpoints.
      fontSize: {
        display: ['clamp(2.25rem, 1.2rem + 4.4vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.035em', fontWeight: '800' }],
        title: ['clamp(1.75rem, 1.1rem + 2.4vw, 2.75rem)', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '700' }],
        section: ['clamp(1.25rem, 1.05rem + 0.8vw, 1.625rem)', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '700' }],
        lede: ['clamp(1rem, 0.95rem + 0.4vw, 1.1875rem)', { lineHeight: '1.6' }],
        meta: ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.005em' }],
        micro: ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.06em' }],
      },

      borderRadius: {
        card: '0.875rem',
        panel: '1.25rem',
      },

      boxShadow: {
        // Depth comes from a soft ambient spread, not a hard drop shadow.
        card: '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -12px rgba(0,0,0,0.7)',
        lift: '0 2px 4px rgba(0,0,0,0.4), 0 20px 40px -16px rgba(0,0,0,0.85)',
        poster: '0 24px 60px -24px rgba(0,0,0,0.95)',
      },

      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },

      transitionDuration: {
        fast: '140ms',
        base: '220ms',
      },

      maxWidth: {
        page: '84rem',
        prose: '68ch',
      },

      screens: {
        xs: '420px',
      },
    },
  },
  plugins: [],
};
