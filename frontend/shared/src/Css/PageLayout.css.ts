import {center, horizontal, padding, vertical, margin, maxWidth} from "csstips";
import {em} from "csx";
import {style} from "typestyle";
import {GlobalCss} from "frontend/shared/src/Css/Global.css";

GlobalCss.setupGlobalStyles();

export namespace PageLayoutCss {
  export const Wrapper = style(vertical, center, {
    $debugName: "Wrapper",
    ...maxWidth(em(35)),
    ...margin(0, "auto"),
    ...padding(em(0.5), em(1)),
  });
  export const Title = style({$debugName: "Title", textAlign: "center"}, padding(em(0.5), 0, em(1), 0), margin(0));
  export const MainContent = style({$debugName: "MainContent"}, padding(em(1), 0, em(1), 0), {});
  export const FooterWrapper = style({$debugName: "FooterWrapper"}, horizontal, padding(em(1)));
}
