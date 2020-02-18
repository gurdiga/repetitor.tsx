import {cssRule} from "typestyle";

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
  }
}
