import {style, forceRenderStyles} from "typestyle";
import {px} from "csx";
import {vertical, verticallySpaced} from "csstips";

import {setupGlobalStyles} from "Common/Global.css";

setupGlobalStyles();
forceRenderStyles();

export const Wrapper = style(vertical);

export const MainContent = style();
