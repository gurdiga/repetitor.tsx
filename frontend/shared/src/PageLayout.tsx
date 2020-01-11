import {PageLayoutCss} from "frontend/shared/PageLayout.css";
import {TopNavigation} from "frontend/shared/TopNavigation";
import {UtilsCss} from "frontend/shared/Utils.css";
import * as React from "react";
import {classes} from "typestyle";

const DEBUG_LAYOUT = false;

interface Props {
  title: string;
  children?: React.ReactNode;
  footerContent?: React.ReactNode;
}

export const PageLayout = (props: Props) => {
  React.useEffect(() => {
    document.title = props.title;
  });

  return (
    <div className={classes(PageLayoutCss.Wrapper, DEBUG_LAYOUT && UtilsCss.DebugLayout)}>
      <nav>
        <TopNavigation />
      </nav>
      <main className={PageLayoutCss.MainContent}>
        <h1 className={PageLayoutCss.Title}>{props.title}</h1>
        {props.children}
      </main>
      <footer className={PageLayoutCss.FooterWrapper}>{props.footerContent || <Footer />}</footer>
    </div>
  );
};

const Footer = () => {
  return <pre>Footer</pre>;
};
