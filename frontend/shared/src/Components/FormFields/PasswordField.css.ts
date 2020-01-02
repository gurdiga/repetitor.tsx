import {style} from "typestyle";
import {percent, em} from "csx";
import {InputCss} from "./Input.css";

export namespace PasswordFieldCss {
  export const InputContainer = style({
    position: "relative",
  });

  export const Input = style(InputCss.InputStyle, {
    width: percent(100),
    fontFamily: "monospace",
    fontSize: em(1.25),
    fontWeight: "normal",
  });

  const eyeSize = em(2);

  export const EyeButton = style({
    border: "none",
    backgroundColor: "transparent",
    width: eyeSize,
    height: eyeSize,
    padding: 0,
    position: "absolute",
    transform: "translateX(-115%)",
    transition: "opacity 0.5s 0.25s",
    $nest: {
      "&:hover": {
        opacity: 0.1,
      },
    },
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
