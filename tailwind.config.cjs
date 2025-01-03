const {
  iconsPlugin,
  getIconCollections,
} = require("@egoist/tailwindcss-icons");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.md", "./.vitepress/**/*.{vue,ts}"],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            "ul > li": {
              "--tw-prose-bullets": "var(--color-blue-light)",
            },
            hr: {
              "border-top": "2px solid var(--color-yellow)",
            },
            code: {
              backgroundColor: "var(--color-blue-light)",
              padding: "0 0.25rem",
              borderRadius: "2px",
              "&::before": {
                content: '""!important',
              },
              "&::after": {
                content: '""!important',
              },
            },
            pre: {
              "background-color": "#F8F8F4",
              "border-radius": "0",
              border: "2px solid black",
              margin: "0",
              "&>code": {
                backgroundColor: "#F8F8F4",
              },
            },
          },
        },
      },
    },
    fontFamily: {
      sans: [
        "LXGWMarkerGothic",
        "ui-sans-serif",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "Arial",
        "Noto Sans",
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"',
      ],
      mono: ["DM Mono", "ui-monospace", "monospace"],
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    iconsPlugin({ collections: getIconCollections(["logos", "solar"]) }),
  ],
};
