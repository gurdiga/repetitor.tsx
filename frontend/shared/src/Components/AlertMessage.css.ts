import {padding} from "csstips";
import {rem} from "csx";
import {style} from "typestyle";
import {NestedCSSProperties} from "typestyle/lib/types";

export namespace AlertMessageCss {
  const alertLayout: NestedCSSProperties = {
    ...padding(rem(0.75), rem(1.25)),
    border: "1px solid transparent",
    borderRadius: rem(0.25),
  };

  export const Info = style({
    $debugName: "Info",
    color: "#004085",
    backgroundColor: "#cce5ff",
    borderColor: "#b8daff",
    ...alertLayout,
  });

  export const Error = style({
    $debugName: "Error",
    color: "#721c24",
    backgroundColor: "#f8d7da",
    borderColor: "#f5c6cb",
    ...alertLayout,
  });

  export const Success = style({
    $debugName: "Success",
    color: "#155724",
    backgroundColor: "#d4edda",
    borderColor: "#c3e6cb",
    ...alertLayout,
  });
}
