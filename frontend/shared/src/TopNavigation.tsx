import {TopNavigationCss} from "frontend/shared/TopNavigation.css";
import * as React from "react";
import {PagePath} from "frontend/shared/PageNavigation";

export function TopNavigation() {
  return (
    <ul className={TopNavigationCss.LinkList}>
      <li>
        <a href={PagePath.Home}>Pagina principală</a>
      </li>
      <li>
        <a href={PagePath.TutorRegistration}>Înregistrare repetitor</a>
      </li>
      <li>
        <a href={PagePath.TutorLogin}>Autentificare repetitor</a>
      </li>
    </ul>
  );
}
