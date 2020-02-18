import {InputCss} from "frontend/shared/Components/FormFields/Input.css";
import {style} from "typestyle";
import {em} from "csx";

export namespace TextFieldCss {
  export const Input = style(InputCss.InputStyle);
  export const Info = style({fontSize: em(0.75), margin: 0});
}
