import {PageLayoutCss} from "frontend/shared/src/Css/PageLayout.css";
import {Footer} from "frontend/shared/src/Footer";
import {TopNavigation} from "frontend/shared/src/TopNavigation";
import * as React from "react";
import {PagePath} from "shared/src/Utils/PagePath";

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
    <div className="container mx-auto p-2">
      <section className="flex justify-between">
        <div>
          <a className="font-display font-black text-xl uppercase" href={PagePath.Home}>
            Logo
          </a>
        </div>
        <nav>
          <TopNavigation {...{isAuthenticated}} />
        </nav>
      </section>

      <main className={PageLayoutCss.MainContent}>
        <h1 className="font-display font-bold text-3xl pt-4">{props.title}</h1>
        {props.children}
      </main>

      <footer className={PageLayoutCss.FooterWrapper}>{props.footerContent || <Footer />}</footer>
    </div>
  );
}
