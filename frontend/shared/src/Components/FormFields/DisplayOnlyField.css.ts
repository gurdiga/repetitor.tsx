import {style} from "typestyle";
import {em} from "csx";

export namespace DisplayOnlyFieldCss {
  export const Value = style({
    $debugName: "Value",
    backgroundColor: "lightgray",
    width: em(17),
    padding: em(0.25),
  });
}
