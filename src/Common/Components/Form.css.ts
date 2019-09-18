import {style} from "typestyle";
import {verticallySpaced, vertical} from "csstips";
import {em} from "csx";

export namespace FormCss {
  export const FieldList = style(verticallySpaced(em(0.5)));
  export const FieldContainer = style(vertical);
}
