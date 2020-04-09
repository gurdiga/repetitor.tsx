import {style} from "typestyle";
import {em} from "csx";

export namespace ResetPasswordLinkCss {
  export const Container = style({
    $debugName: "Container",
    fontSize: "smaller",
    textAlign: "right",
  });

  export const Link = style({
    $debugName: "Link",
    padding: em(0.25),
  });
}
