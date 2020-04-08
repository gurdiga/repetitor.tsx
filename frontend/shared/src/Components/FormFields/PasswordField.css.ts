import {em, percent} from "csx";
import {InputCss} from "frontend/shared/src/Components/FormFields/Input.css";
import {style} from "typestyle";
import {ButtonStyle} from "frontend/shared/src/Css/Button.css";

export namespace PasswordFieldCss {
  export const InputContainer = style({
    $debugName: "InputContainer",
    position: "relative",
    width: em(20),
  });

  const eyeSize = em(2);

  export const Input = style(InputCss.Input, {
    $debugName: "Input",
    width: percent(100),
    fontFamily: "monospace",
    fontSize: em(1.25),
    fontWeight: "normal",
    paddingRight: eyeSize,
    textOverflow: "ellipsis",
  });

  export const EyeButton = style(ButtonStyle, {
    $debugName: "EyeButton",
    border: "none",
    backgroundColor: "transparent",
    width: eyeSize,
    height: eyeSize,
    padding: 0,
    position: "absolute",
    transform: "translateX(-115%)",
    transition: "opacity 0.5s 0.25s",
    opacity: 0.2,
    $nest: {
      "&:hover": {
        opacity: 0.8,
      },
    },
  });

  export const GenerateButton = style({
    $debugName: "GenerateButton",
    border: "none",
    backgroundColor: "transparent",
    padding: 0,
    fontSize: percent(75),
    position: "absolute",
    right: 0,
    transform: "translateY(-115%)",
    cursor: "pointer",
  });
}
