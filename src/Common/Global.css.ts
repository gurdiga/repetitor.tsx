import {cssRule, cssRaw} from "typestyle";

const rootElementSelector = "#root";

const fontFamily = [
  "sans-serif",
  "'Helvetica Neue'",
  "'Droid Sans'",
  "'Fira Sans'",
  "Cantarell",
  "Ubuntu",
  "Oxygen",
  "Roboto",
  "'Segoe UI'",
  "BlinkMacSystemFont",
  "-apple-system",
];

export function setupGlobalStyles() {
  cssRaw(`
/**
 * Reset CSS
 */
html, body {
  height: 100%;
  width: 100%;
  padding: 0px;
  margin: 0px;
}
html {
  box-sizing: border-box;
}
*, *:before, *:after {
  box-sizing: inherit;
}
`);

  cssRule(rootElementSelector, {
    fontFamily,
  });
}
