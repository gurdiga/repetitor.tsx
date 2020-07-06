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
    fontFamily: PrimaryFont,
  });
}

export const PrimaryFont = "Vollkorn";
export const SecondaryFont = "Inria Sans";
