import {normalize, setupPage} from "csstips";
import {cssRule} from "typestyle";

const rootElementSelector = "#root";

export namespace GlobalCss {
  export function setupGlobalStyles() {
    // Recommended by TypeStyle guide. https://typestyle.github.io/#/page
    normalize();
    setupPage(rootElementSelector);

    // App styles
    setDefaultFontFamily(rootElementSelector);
  }
}

function setDefaultFontFamily(rootElementSelector: string) {
  cssRule(rootElementSelector, {
    fontFamily: [
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
    ],
  });
}
