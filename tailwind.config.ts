import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'lx-navy':    '#0f2744',
        'lx-blue':    '#1a3f6f',
        'lx-hover':   '#244f8a',
        'lx-ochre':   '#c8922a',
        'lx-ochre-lt':'#e8b84b',
        'lx-offwhite':'#f5f5f0',
        'lx-warm':    '#eae8e2',
        'lx-text':    '#1a1a18',
        'lx-muted':   '#6b7a84',
        'lx-border':  '#d4d0c8',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans:  ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
