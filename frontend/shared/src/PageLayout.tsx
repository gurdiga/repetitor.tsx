import {PageLayoutCss} from "frontend/shared/src/Css/PageLayout.css";
import {Footer} from "frontend/shared/src/Footer";
import {TopNavigation} from "frontend/shared/src/TopNavigation";
import * as React from "react";

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
    <div className="container mx-auto">
      <section className="flex justify-between p-2">
        <div className="font-bold">Logo</div>
        <nav>
          <TopNavigation {...{isAuthenticated}} />
        </nav>
      </section>
      <main className={PageLayoutCss.MainContent}>
        <h1 className={PageLayoutCss.Title}>{props.title}</h1>
        {props.children}
      </main>
      <footer className={PageLayoutCss.FooterWrapper}>{props.footerContent || <Footer />}</footer>
    </div>
  );
}
