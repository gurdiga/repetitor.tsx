import {center, horizontal, padding, vertical, margin} from "csstips";
import {em} from "csx";
import {GlobalCss} from "frontend/shared/Css/Global.css";
import {style} from "typestyle";

GlobalCss.setupGlobalStyles();

export namespace PageLayoutCss {
  export const Wrapper = style(vertical, center, padding(em(0.5), em(1)));
  export const Title = style(padding(em(0.5), 0, em(1), 0), margin(0));
  export const MainContent = style(padding(em(1), 0, em(1), 0), {});
  export const FooterWrapper = style(horizontal, padding(em(1)));
}
