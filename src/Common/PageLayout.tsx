import * as React from "react";
import {classes} from "typestyle";

import {Wrapper, MainContent} from "Common/PageLayout.css";
import {DebugLayout} from "Common/Utils.css";

interface Props {
  children?: React.ReactNode;
  footerConten?: React.ReactNode;
}

export const PageLayout = (props: Props) => (
  <div className={classes(Wrapper, DebugLayout)}>
    <nav>Top navigation</nav>
    <main className={MainContent}>{props.children}</main>
    <footer>{props.footerConten || <Footer />}</footer>
  </div>
);

const Footer = () => {
  return <>Footer</>;
};
