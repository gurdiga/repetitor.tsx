import {style} from "typestyle";
import {verticallySpaced, vertical, horizontal} from "csstips";
import {em} from "csx";
import {NestedCSSProperties} from "typestyle/lib/types";

const removeListStyle: NestedCSSProperties = {
  margin: 0,
  padding: 0,
  listStyleType: "none",
};

export namespace FormCss {
  export const FormContainer = style(vertical, verticallySpaced(em(1)));
  export const FieldListContainer = style(removeListStyle, verticallySpaced(em(0.75)));
  export const FieldContainer = style(vertical, verticallySpaced(em(0.1)));
  export const ActionButtonListContainer = style(removeListStyle, horizontal);
}
