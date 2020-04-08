import {style} from "typestyle";
import {ButtonStyle} from "frontend/shared/src/Css/Button.css";

export namespace SecondaryButtonCss {
  export const Button = style({...ButtonStyle, fontWeight: "normal"});
}
