import {em} from "csx";
import {NestedCSSProperties} from "typestyle/lib/types";
import {width} from "csstips";

export namespace InputCss {
  export const Input: NestedCSSProperties = {
    padding: em(0.25),
    boxSizing: "border-box",
    ...width(em(17)),
  };
}
