import {TopNavigationCss} from "frontend/shared/src/TopNavigation.css";
import * as React from "react";
import {PagePath} from "shared/src/Utils/PagePath";

interface Props {
  isAuthenticated: boolean;
}

export function TopNavigation(props: Props) {
  const {isAuthenticated} = props;

  return (
    <ul className={TopNavigationCss.LinkList}>
      {isAuthenticated && (
        <li>
          <a className="font-light" href={PagePath.Profile}>
            Profil
          </a>
        </li>
      )}
      {!isAuthenticated && (
        <>
          <li>
            <a className="font-light" href={PagePath.Registration}>
              Înregistrare
            </a>
          </li>
          <li>
            <a className="font-light" href={PagePath.Login}>
              Autentificare
            </a>
          </li>
        </>
      )}
    </ul>
  );
}
