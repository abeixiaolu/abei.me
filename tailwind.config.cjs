const {
  iconsPlugin,
  getIconCollections,
} = require('@egoist/tailwindcss-icons')

/** @type {import('tailwindcss').Config} */
module.exports = {
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
  },
  plugins: [
    iconsPlugin({
      collections: getIconCollections(['logos', 'solar', 'simple-icons', 'ph', 'uiw', 'mdi', 'fa6-brands']),
      extraProperties: {
        'vertical-align': '-0.25em',
        'font-size': '1.3em',
      },
    }),
  ],
}
