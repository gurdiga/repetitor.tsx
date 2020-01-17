import {TopNavigationCss} from "frontend/shared/TopNavigation.css";
import * as React from "react";

export const TopNavigation: React.FunctionComponent<{}> = () => (
  <ul className={TopNavigationCss.LinkList}>
    <li>
      <a href="/">Pagina principală</a>
    </li>
    <li>
      <a href="/inregistrare/">Înregistrare</a>
    </li>
  </ul>
);
