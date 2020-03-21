import {InputCss} from "frontend/shared/src/Components/FormFields/Input.css";
import {style} from "typestyle";
import {em} from "csx";
import {maxWidth} from "csstips";

export namespace TextFieldCss {
  export const Input = style({$debugName: "Input"}, InputCss.Input);
  export const Info = style({$debugName: "Info", fontSize: em(0.75), margin: 0});
}
