import * as React from "react";
import {TopNavigationCss} from "./TopNavigation.css";

export const TopNavigation = () => (
  <ul className={TopNavigationCss.LinkList}>
    <li>
      <a href="/">Pagina principală</a>
    </li>
    <li>
      <a href="/inregistrare/">Înregistrare</a>
    </li>
  </ul>
);
