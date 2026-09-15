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

        /* Cinematic aliases — the named tokens the design language refers to. */
        'cinematic-background': '#08080A',
        'cinematic-surface': 'rgba(20, 20, 25, 0.72)',
        'cinematic-border': 'rgba(255, 255, 255, 0.09)',
        'glass-surface': 'rgba(255, 255, 255, 0.045)',
        'glass-highlight': 'rgba(255, 255, 255, 0.10)',
        'gold-accent': '#E8B33E',

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

      /*
       * Depth scale. Each step layers a tight contact shadow, a mid ambient
       * spread and a wide soft falloff — that stack is what reads as real
       * elevation. A single large blur just reads as fog.
       */
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.45), 0 8px 24px -12px rgba(0,0,0,0.7)',
        lift: '0 2px 4px rgba(0,0,0,0.45), 0 20px 40px -16px rgba(0,0,0,0.85)',
        hover:
          '0 2px 6px rgba(0,0,0,0.5), 0 12px 24px -8px rgba(0,0,0,0.6), 0 32px 64px -24px rgba(0,0,0,0.9)',
        poster:
          '0 4px 10px rgba(0,0,0,0.5), 0 18px 36px -12px rgba(0,0,0,0.7), 0 40px 80px -32px rgba(0,0,0,0.95)',
        panel:
          '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 28px -12px rgba(0,0,0,0.75), 0 48px 96px -48px rgba(0,0,0,0.9)',
        // Contact shadow for a control resting on a surface.
        control: '0 1px 2px rgba(0,0,0,0.5), 0 2px 6px -2px rgba(0,0,0,0.4)',

        /*
         * Glass stack: an inner top highlight reads as a lit edge, an inner
         * bottom shade reads as thickness, then ambient falloff underneath.
         * That combination is what makes a panel look like a physical slab
         * rather than a translucent rectangle.
         */
        'ambient-shadow':
          'inset 0 1px 0 0 rgba(255,255,255,0.10), inset 0 -1px 0 0 rgba(0,0,0,0.5), 0 24px 48px -24px rgba(0,0,0,0.8)',
        'depth-shadow':
          'inset 0 1px 0 0 rgba(255,255,255,0.12), 0 2px 8px rgba(0,0,0,0.5), 0 24px 48px -20px rgba(0,0,0,0.75), 0 64px 120px -60px rgba(0,0,0,0.95)',
        'nav-float':
          'inset 0 1px 0 0 rgba(255,255,255,0.08), 0 8px 24px -12px rgba(0,0,0,0.8), 0 2px 6px -2px rgba(0,0,0,0.5)',
        'gold-glow': '0 0 0 1px rgba(232,179,62,0.35), 0 8px 28px -10px rgba(232,179,62,0.30)',
      },

      perspective: {
        'perspective-card': '900px',
        card: '900px',
        panel: '1600px',
      },

      transitionProperty: {
        depth: 'transform, box-shadow, border-color, background-color, opacity',
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
