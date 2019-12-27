import {style} from "typestyle";
import {em} from "csx";
import {horizontal, horizontallySpaced} from "csstips";

export namespace CheckboxCss {
  export const Container = style(horizontal, horizontallySpaced(em(0.25)));
}
