const { iconsPlugin, getIconCollections } = require("@egoist/tailwindcss-icons");

/** @type {import('tailwindcss').Config} */
module.exports = {
  plugins: [
    iconsPlugin({
      collections: getIconCollections([
        "pixelarticons",
        "simple-icons",
        "ph",
        "mdi",
      ]),
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
      },
    }),
  ],
};
