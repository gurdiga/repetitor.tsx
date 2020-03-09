import {style} from "typestyle";
import {verticallySpaced, vertical, horizontal, maxWidth, margin} from "csstips";
import {em} from "csx";
import {removeListStyle} from "frontend/shared/Css/Utils.css";

export namespace FormCss {
  export const FormContainer = style(vertical, {
    $debugName: "FormContainer",
    ...verticallySpaced(em(1)),
    ...maxWidth(em(17)),
    ...margin(0, "auto"),
  });
  export const FieldListContainer = style(removeListStyle, {
    $debugName: "FieldListContainer",
    ...verticallySpaced(em(0.75)),
  });
  export const FieldContainer = style(vertical, {$debugName: "FieldContainer", ...verticallySpaced(em(0.1))});
  export const ActionButtonListContainer = style(removeListStyle, horizontal, {
    $debugName: "ActionButtonListContainer",
  });
}
