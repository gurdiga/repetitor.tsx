import {TopNavigationCss} from "frontend/shared/TopNavigation.css";
import * as React from "react";
import {PagePath} from "frontend/shared/PageNavigation";

export function TopNavigation() {
  return (
    <ul className={TopNavigationCss.LinkList}>
      <li>
        <a href={PagePath.Home}>Home</a>
      </li>
      <li>
        <a href={PagePath.TutorRegistration}>Înregistrare</a>
      </li>
      <li>
        <a href={PagePath.TutorLogin}>Autentificare</a>
      </li>
    </ul>
  );
}
