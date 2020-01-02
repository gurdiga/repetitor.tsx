import {style} from "typestyle";
import {percent, quote} from "csx";

export namespace ValidationMessageCss {
  export const Text = style({
    color: "red",
    fontSize: percent(80),
    $nest: {
      "&::before": {
        content: quote("↑ "),
        fontWeight: "bold",
      },
    },
  });
}
