import {style} from "typestyle";
import {NestedCSSProperties} from "typestyle/lib/types";

const DebugOutline: NestedCSSProperties = {boxShadow: "1px 1px 2px ForestGreen"};

export const DebugLayout = style(DebugOutline, {
  $nest: {
    "*": DebugOutline,
  },
});
