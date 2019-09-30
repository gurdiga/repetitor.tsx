import {style} from "typestyle";
import {percent, em} from "csx";

export namespace PasswordFieldCss {
  export const ShowPasswordCheckbox = style({
    fontSize: percent(80),
    paddingLeft: em(0.25),
  });

  const eyeSize = em(1.5);

  export const EyeButton = style({
    border: "dashed 1px green",
    background: "transparent",
    cursor: "pointer",
    width: eyeSize,
    height: eyeSize,
    padding: 0,
    position: "absolute",
  });
}
