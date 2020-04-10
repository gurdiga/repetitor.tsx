import {style} from "typestyle";
import {em} from "csx";
import {InputCss} from "frontend/shared/src/Components/FormFields/Input.css";

export namespace DisplayOnlyFieldCss {
  export const Value = style({
    $debugName: "Value",
    backgroundColor: "lightgray",
    width: em(17),
    padding: `calc(${InputCss.Input.padding} + 3px)`, // To align with input; 3px is input’s default border-width
  });
}
