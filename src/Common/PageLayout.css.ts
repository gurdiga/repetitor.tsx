import {style, forceRenderStyles} from "typestyle";
import {vertical, padding, center, horizontal} from "csstips";

import {GlobalCss} from "Common/Global.css";
import {em} from "csx";

GlobalCss.setupGlobalStyles();
forceRenderStyles();

export namespace PageLayoutCss {
  export const Wrapper = style(vertical, center, padding(em(0.5), em(1)));
  export const Title = style(padding(em(0.5), 0, em(1), 0));
  export const MainContent = style(padding(em(1), 0, em(1), 0), {});
  export const FooterWrapper = style(horizontal, padding(em(1)));
}
