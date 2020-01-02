import {normalize, setupPage} from "csstips";
import {ResetCss} from "./Reset.css";

const rootElementSelector = "#root";

export namespace GlobalCss {
  export function setupGlobalStyles() {
    // Recommended by TypeStyle guide. https://typestyle.github.io/#/page
    normalize();
    setupPage(rootElementSelector);

    // App styles
    ResetCss.rules(rootElementSelector);
  }
}
