const {
  iconsPlugin,
  getIconCollections,
} = require('@egoist/tailwindcss-icons')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.md', './.vitepress/**/*.{vue,ts}'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            'maxWidth': '100%',
            'h1, h2, h3, h4, h5, h6, a': {
              color: 'var(--color-text)',
            },
            'li': {
              '&::marker': {
                color: 'var(--color-text)',
              },
            },
            'color': 'var(--color-text)',
            'pre': {
              backgroundColor: 'var(--color-code-bg)',
            },
          },
        },
      },
    },
    fontFamily: {
      sans: ['anwt', 'LXGWNeoZhiSongPlus', 'ui-sans-serif', 'system-ui', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
    },
  },
  plugins: [
    iconsPlugin({
      collections: getIconCollections(['logos', 'solar', 'simple-icons', 'uiw', 'mdi', 'fa6-brands']),
      extraProperties: {
        'vertical-align': '-0.25em',
        'font-size': '1.3em',
      },
    }),
  ],
}
