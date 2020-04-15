import {style, keyframes} from "typestyle";
import {ButtonStyle} from "frontend/shared/src/Css/Button.css";
import {scale, rotate, deg, em} from "csx";

export namespace SubmitButtonCss {
  export const Button = style({...ButtonStyle});

  export const Illustration = style({
    display: "inline-block",
    marginLeft: em(1)
  });

  export const IllustrationSuccess = style({
    animationName: keyframes({
      '50%': {transform: scale(1.2)}
    }),
    animationDuration: '0.5s',
    animationIterationCount: 'infinite',
  });

  export const IllustrationPending = style({
    animationName: keyframes({
      'from': {transform: rotate(deg(0))},
      'to': {transform: rotate(deg(360))}
    }),
    animationDuration: '0.5s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  });
}
