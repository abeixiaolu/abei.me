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
            'ul > li': {
              '--tw-prose-bullets': 'var(--color-blue-light)',
            },
            'hr': {
              'border-top': '2px solid var(--color-gray)',
            },
            'code': {
              backgroundColor: 'var(--color-gray)',
              borderRadius: '2px',
              padding: '3px 6px',
              fontWeight: 'bold',
            },
            'pre': {
              // "background-color": "#F8F8F4",
              'border-radius': '0',
              'border': '2px solid black',
              'margin': '0',
              '&>code': {
                // backgroundColor: "#F8F8F4",
              },
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
