import {style} from "typestyle";
import {verticallySpaced, vertical, horizontal} from "csstips";
import {em} from "csx";

export namespace FormCss {
  export const FormContainer = style(vertical, verticallySpaced(em(1)));
  export const FieldListContainer = style(verticallySpaced(em(0.5)));
  export const FieldContainer = style(vertical, verticallySpaced(em(0.1)));
  export const ActionButtonListContainer = style(horizontal);
}
