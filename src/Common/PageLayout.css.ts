import {style, forceRenderStyles} from "typestyle";
import {setupGlobalStyles} from "Common/Global.css";
import {em} from "csx";
import {padding, vertical, verticallySpaced} from "csstips";

setupGlobalStyles();
forceRenderStyles();

export const FlexChild = style(vertical, verticallySpaced(em(1)), padding(em(10)), {});
/* Have some basic elements:

- horizontal/vertical container
- flexible/conten child

*/
