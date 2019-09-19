import {style} from "typestyle";
import {percent, em} from "csx";

export namespace PasswordFieldCss {
  export const ShowPasswordCheckbox = style({
    fontSize: percent(80),
    paddingLeft: em(0.25),
  });
}
