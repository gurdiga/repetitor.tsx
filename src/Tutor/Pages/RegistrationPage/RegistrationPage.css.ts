import {style} from "typestyle";
import {verticallySpaced, vertical} from "csstips";
import {em} from "csx";

export namespace RegistrationPageCss {
  export const Form = style({
    $nest: {
      label: {
        display: "block",
      },
    },
  });

  export const FieldList = style(verticallySpaced(em(0.5)), {
    $nest: {
      li: vertical,
    },
  });
}
