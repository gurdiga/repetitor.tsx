import {PageLayoutCss} from "frontend/shared/src/Css/PageLayout.css";
import {UtilsCss} from "frontend/shared/src/Css/Utils.css";
import {TopNavigation} from "frontend/shared/src/TopNavigation";
import * as React from "react";
import {classes} from "typestyle";

const DEBUG_LAYOUT = false;

interface Props {
  title: string;
  isAuthenticated: boolean;
  children?: React.ReactNode;
  footerContent?: React.ReactNode;
}

export function PageLayout(props: Props) {
  const {isAuthenticated} = props;

  document.title = props.title;

  return (
    <div className={classes(PageLayoutCss.Wrapper, DEBUG_LAYOUT && UtilsCss.DebugLayout)}>
      <nav>
        <TopNavigation {...{isAuthenticated}} />
      </nav>
      <main className={PageLayoutCss.MainContent}>
        <h1 className={PageLayoutCss.Title}>{props.title}</h1>
        {props.children}
      </main>
      <footer className={PageLayoutCss.FooterWrapper}>{props.footerContent || <Footer />}</footer>
    </div>
  );
}

const Footer = () => {
  return <pre>Footer</pre>;
};
