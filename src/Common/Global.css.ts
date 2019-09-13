import {cssRule} from "typestyle";
import {normalize, setupPage} from "csstips";

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

export namespace GlobalCss {
  export function setupGlobalStyles() {
    // Recommended by TypeStyle guide. https://typestyle.github.io/#/page
    normalize();
    setupPage(rootElementSelector);

    // Mine.
    cssRule(rootElementSelector, {
      fontFamily,
    });
  }
}
