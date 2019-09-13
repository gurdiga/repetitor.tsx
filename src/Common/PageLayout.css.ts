import {style, forceRenderStyles} from "typestyle";
import {vertical} from "csstips";

import {GlobalCss} from "Common/Global.css";

GlobalCss.setupGlobalStyles();
forceRenderStyles();

export namespace PageLayoutCss {
  export const Wrapper = style(vertical);

  export const MainContent = style();
}
