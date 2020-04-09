import {style} from "typestyle";
import {em} from "csx";

export namespace DisplayOnlyFieldCss {
  export const Value = style({
    $debugName: "Value",
    backgroundColor: "lightgray",
    width: em(17),
    padding: "calc(0.25em + 3px)", // To align with input; 3px is input’s border-width
  });
}
