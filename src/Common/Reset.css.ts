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
    cssRule("*", {
      margin: important(0),
    });

    // Lists
    cssRule("ul, ol", {
      listStyleType: "none",
      padding: 0,
    });

    cssRule("button", {
      cursor: "pointer",
    });
  }
}
