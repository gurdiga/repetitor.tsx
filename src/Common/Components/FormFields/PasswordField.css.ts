import {style} from "typestyle";
import {percent, em} from "csx";

export namespace PasswordFieldCss {
  export const FieldContainer = style({
    position: "relative",
  });

  export const Field = style({
    width: percent(100),
  });

  const eyeSize = em(1.75);

  export const EyeButton = style({
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    width: eyeSize,
    height: eyeSize,
    padding: 0,
    position: "absolute",
    transform: "translateX(-115%)",
  });
}
