/* global module, require */
const defaultTheme = require("tailwindcss/defaultTheme");

const DisplayTypeface = "Vollkorn";
const BodyTypeface = "'Inria Sans'";

module.exports = {
  purge: [],
  theme: {
    extend: {
      fontFamily: {
        sans: [BodyTypeface, ...defaultTheme.fontFamily.sans],
        serif: [DisplayTypeface, ...defaultTheme.fontFamily.serif],
        display: [DisplayTypeface],
        body: [BodyTypeface],
      },
      transitionProperty: {
        height: "height, max-height",
      },
      maxHeight: {
        ...defaultTheme.maxHeight,
        "0": "0",
      },
    },
  },
  variants: {},
  plugins: [require("@tailwindcss/custom-forms")],
};
