import {style} from "typestyle";
import {percent, em} from "csx";

export namespace PasswordFieldCss {
  export const FieldContainer = style({
    position: "relative",
  });

  export const Field = style({
    width: percent(100),
    fontFamily: "monospace",
    height: em(2.25),
  });

  const eyeSize = em(1.75);

  export const EyeButton = style({
    border: "none",
    backgroundColor: "transparent",
    width: eyeSize,
    height: eyeSize,
    padding: 0,
    position: "absolute",
    transform: "translateX(-115%)",
  });

  export const GenerateButton = style({
    border: "none",
    backgroundColor: "transparent",
    padding: 0,
    textDecoration: "underline",
    fontSize: percent(75),
    position: "absolute",
    right: 0,
    transform: "translateY(-115%)",
  });
}
