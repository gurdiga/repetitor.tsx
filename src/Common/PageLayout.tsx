import * as React from "react";
import {classes} from "typestyle";

import {PageLayoutCss} from "Common/PageLayout.css";
import {UtilsCss} from "Common/Utils.css";
import {TopNavigation} from "Common/TopNavigation";

const DEBUG_LAYOUT = false;

interface Props {
  children?: React.ReactNode;
  footerConten?: React.ReactNode;
}

export const PageLayout = (props: Props) => (
  <div className={classes(PageLayoutCss.Wrapper, DEBUG_LAYOUT && UtilsCss.DebugLayout)}>
    <nav>
      <TopNavigation />
    </nav>
    <main className={PageLayoutCss.MainContent}>{props.children}</main>
    <footer>{props.footerConten || <Footer />}</footer>
  </div>
);

const Footer = () => {
  return <>Footer</>;
};
