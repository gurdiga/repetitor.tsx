import {TopNavigationCss} from "frontend/shared/TopNavigation.css";
import * as React from "react";

export function TopNavigation() {
  return (
    <ul className={TopNavigationCss.LinkList}>
      <li>
        <a href="/">Pagina principală</a>
      </li>
      <li>
        <a href="/inregistrare-repetitor/">Înregistrare repetitor</a>
      </li>
      <li>
        <a href="/autentificare-repetitor/">Autentificare repetitor</a>
      </li>
    </ul>
  );
}
