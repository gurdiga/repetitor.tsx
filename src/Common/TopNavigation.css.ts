import {style} from "typestyle";
import {horizontal, horizontallySpaced} from "csstips";
import {em} from "csx";

export namespace TopNavigationCss {
  export const LinkList = style(horizontal, horizontallySpaced(em(1)), {
    padding: 0,
    listStyleType: "none",
  });
}
