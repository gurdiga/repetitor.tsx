import {cssRule} from "typestyle";
import {important} from "csx";

export namespace ResetCss {
  export function rules(rootElementSelector: string) {
    // Font
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

    // No default margins
    cssRule(`${rootElementSelector} *`, {
      margin: 0,
    });

    // Lists
    cssRule(`${rootElementSelector} ul, ${rootElementSelector} ol`, {
      listStyleType: "none",
      padding: 0,
    });

    cssRule(`${rootElementSelector} button`, {
      cursor: "pointer",
    });

    cssRule(`${rootElementSelector} p`, {
      marginTop: "0.5em",
    });
  }
}
