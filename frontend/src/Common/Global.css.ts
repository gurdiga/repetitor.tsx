import {normalize, setupPage} from "csstips";

import {ResetCss} from "Common/Reset.css";

const rootElementSelector = "#root";

export namespace GlobalCss {
  export function setupGlobalStyles() {
    // Recommended by TypeStyle guide. https://typestyle.github.io/#/page
    normalize();
    setupPage(rootElementSelector);

    // Mine.
    ResetCss.rules(rootElementSelector);
  }
}
