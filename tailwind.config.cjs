const { iconsPlugin, getIconCollections } = require("@egoist/tailwindcss-icons");

/** @type {import('tailwindcss').Config} */
module.exports = {
  plugins: [
    iconsPlugin({
      collections: getIconCollections(["carbon"]),
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
      },
    }),
  ],
};
