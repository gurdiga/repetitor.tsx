import {style, forceRenderStyles} from "typestyle";
import {vertical, padding} from "csstips";

import {GlobalCss} from "Common/Global.css";
import {em} from "csx";

GlobalCss.setupGlobalStyles();
forceRenderStyles();

export namespace PageLayoutCss {
  export const Wrapper = style(vertical, padding(em(0.5), em(1)));

  export const MainContent = style(padding(em(1), 0, em(1), 0), {});
}
