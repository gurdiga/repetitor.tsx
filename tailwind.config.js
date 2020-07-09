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
    },
  },
  variants: {},
  plugins: [require("@tailwindcss/custom-forms")],
};
