import {horizontal, horizontallySpaced} from "csstips";
import {em} from "csx";
import {style} from "typestyle";

export namespace CheckboxCss {
  export const Container = style({$debugName: "Container"}, horizontal, horizontallySpaced(em(0.25)), {
    marginTop: em(0.5),
    alignItems: "baseline",
  });
}
