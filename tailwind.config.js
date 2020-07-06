// eslint-disable-next-line no-undef
const defaultTheme = require("tailwindcss/defaultTheme");

const DisplayTypeface = "Vollkorn";
const BodyTypeface = "'Inria Sans'";

// eslint-disable-next-line no-undef
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
  plugins: [],
};
