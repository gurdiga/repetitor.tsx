// eslint-disable-next-line no-undef
const defaultTheme = require("tailwindcss/defaultTheme");

// eslint-disable-next-line no-undef
module.exports = {
  purge: [],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inria Sans", ...defaultTheme.fontFamily.sans],
        serif: ["Vollkorn", ...defaultTheme.fontFamily.serif],
      },
    },
  },
  variants: {},
  plugins: [],
};
